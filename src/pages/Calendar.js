import React, { useState, useEffect } from 'react';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        // Function to fetch calendar events
        const fetchEvents = async () => {
            try {
                const response = await window.gapi.client.calendar.events.list({
                    'calendarId': 'primary',
                    'timeMin': (new Date()).toISOString(),
                    'showDeleted': false,
                    'singleEvents': true,
                    'maxResults': 10,
                    'orderBy': 'startTime'
                });

                setEvents(response.result.items);
            } catch (error) {
                console.error('Error fetching events', error);
            }
        };

        window.gapi.load('client:auth2', () => {
            window.gapi.client.init({
                // Your API Client initialization settings
            }).then(() => {
                fetchEvents();
            });
        });
    }, []);

    function sendEmail(recipient, subject, message) {
        const emailLines = [];

        emailLines.push(`To: ${recipient}`);
        emailLines.push(`Subject: ${subject}`);
        emailLines.push('Content-type: text/plain;charset=utf-8');
        emailLines.push('');
        emailLines.push(message);

        const email = emailLines.join('\r\n').trim();
        const base64EncodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        window.gapi.client.load('gmail', 'v1', () => {
            const request = window.gapi.client.gmail.users.messages.send({
                'userId': 'me',
                'resource': {
                    'raw': base64EncodedEmail
                }
            });
            request.execute((resp) => {
                console.log('Email sent', resp);
            });
        });
    }

    return (
        <div className="table-container">
            <h1>My Calendar Events</h1>
            <table>
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Event Name</th>
                    <th>Attendees</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {events.map((event, index) => (
                    <tr key={index}>
                        <td>{new Date(event.start.dateTime).toLocaleString()}</td>
                        <td>{event.summary}</td>
                        <td>
                            {event.attendees && event.attendees.map(attendee => attendee.email).join(', ')}
                        </td>
                        <td>
                            <button className="send-email-button" onClick={() => sendEmail("email@example.com", "Sample Email", "This is a test")}>Send Email</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CalendarPage;

