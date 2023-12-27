import React, { useState, useEffect } from 'react';
import './styles.css';

const CLIENT_ID = ''; // add client_ID
const API_KEY = ''; // add actual API key

const Home = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [events, setEvents] = useState([]);

    //initialize google apis
    useEffect(() => {
        const initClient = async () => {
            await window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            });
            window.gapi.client.load('calendar', 'v3', () => console.log('GAPI client loaded for API'));
        };

        const gapiLoaded = () => {
            window.gapi.load('client:auth2', initClient);
        };

        const gisLoaded = () => {
            window.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/gmail.send',
                callback: '',
            });
        };

        gapiLoaded();
        gisLoaded();
    }, []);

    const handleAuthClick = () => {
        window.tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                throw resp;
            }
            setIsAuthorized(true);
            const token = resp.access_token;

            //sendEmail(token, 'hongji667719@gmail.com', 'Test Subject', 'Hello, this is a test email.');
            //sendTokenToServer(token, 'hongji667719@gmail.com', 'Test Subject', 'This is the body of the email.');
            GetUpcomingEvents();
        };

        if (window.gapi.client.getToken() === null) {
            window.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            window.tokenClient.requestAccessToken({ prompt: '' });
        }
    };

    const GetUpcomingEvents = async () => {
        try {
            const response = await window.gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 10,
                'orderBy': 'startTime',
            });

            const eventsWithAttendees = response.result.items.map(event => {
                return {
                    ...event,
                    attendeeEmails: event.attendees ? event.attendees.map(attendee => attendee.email) : []
                };
            });

            setEvents(eventsWithAttendees);
        } catch (err) {
            console.error(err);
        }
    };

    //make api call to spring to persist events

    function sendEmail(authToken, recipient, subject, message) {
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
        <div>
            <h1 className="meeting-mate-title">Meeting Mate</h1>
            <img src="/meetingmate.png" className="meeting-mate-image"/>
            {isAuthorized ? (
                <div>
                    <h2>Welcome!</h2>
                    <p>You have successfully logged in.</p>
                </div>
            ) : (
                <button onClick={handleAuthClick}>Authorize</button>
            )}
        </div>
    );
};

export default Home;
