const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const app = express();

app.use(bodyParser.json());

// MySQL connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bitespeed'
};

// Endpoint to handle /identify requests
app.post('/identify', async (req, res) => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'Either email or phoneNumber must be provided' });
    }

    let connection;
    try {
        // Connect to MySQL database
        connection = await mysql.createConnection(dbConfig);

        // Query to find existing contacts
        const [rows] = await connection.execute(
            'SELECT * FROM Contact WHERE email = ? OR phoneNumber = ? AND deletedAt IS NULL',
            [email, phoneNumber]
        );

        let primaryContact = null;
        let secondaryContacts = [];

        // Find primary and secondary contacts
        rows.forEach(contact => {
            if (contact.linkPrecedence === 'primary') {
                primaryContact = contact;
            } else {
                secondaryContacts.push(contact);
            }
        });

        // If no primary contact, create a new one
        if (!primaryContact) {
            const [result] = await connection.execute(
                'INSERT INTO Contact (email, phoneNumber, linkPrecedence) VALUES (?, ?, "primary")',
                [email, phoneNumber]
            );
            primaryContact = {
                id: result.insertId,
                email,
                phoneNumber,
                linkPrecedence: 'primary',
                createdAt: new Date(),
                updatedAt: new Date()
            };
        } else {
            // If primary contact exists but with new email or phone, create secondary contact
            if ((email && primaryContact.email !== email) || (phoneNumber && primaryContact.phoneNumber !== phoneNumber)) {
                const [result] = await connection.execute(
                    'INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence) VALUES (?, ?, ?, "secondary")',
                    [email, phoneNumber, primaryContact.id]
                );
                secondaryContacts.push({
                    id: result.insertId,
                    email,
                    phoneNumber,
                    linkedId: primaryContact.id,
                    linkPrecedence: 'secondary',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        // Prepare the response object
        const response = {
            primaryContactId: primaryContact.id,
            emails: [primaryContact.email],
            phoneNumbers: [primaryContact.phoneNumber],
            secondaryContactIds: secondaryContacts.map(contact => contact.id)
        };

        // Add secondary contacts' emails and phone numbers
        secondaryContacts.forEach(contact => {
            if (contact.email) response.emails.push(contact.email);
            if (contact.phoneNumber) response.phoneNumbers.push(contact.phoneNumber);
        });

        res.status(200).json({ contact: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
