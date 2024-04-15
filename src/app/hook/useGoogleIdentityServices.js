// hooks/useGoogleIdentityServices.js
import {useEffect} from 'react';

const useGoogleIdentityServices = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = () => {
            if (document.getElementById('signInDiv')) {
                initializeGoogleSignIn();
            } else {
                console.error('signInDiv not found');
            }
        };
        document.body.appendChild(script);

        const initializeGoogleSignIn = () => {
            window.google.accounts.id.initialize({
                client_id: '1093324646306-ls0epdq7o8nfvhgq4dj3d0i1a3m59ncc.apps.googleusercontent.com',
                callback: handleCredentialResponse,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('signInDiv'),
                {theme: 'outline', size: 'large'}
            );
        };

        const handleCredentialResponse = async (response) => {
            console.log('Encoded JWT ID token: ' + response.credential);
            try {
                const backendResponse = await fetch('http://127.0.0.1:9090/api/google/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({token: response.credential}),
                });

                if (!backendResponse.ok) {
                    throw new Error('Failed to authenticate with the backend');
                }

                const data = await backendResponse.json();
                console.log('Backend response:', data);

                // Example: Update frontend login state and store session token
                localStorage.setItem('authToken', data.sessionToken); // Assuming your backend responds with a sessionToken
                window.dispatchEvent(new Event('login')); // You might want to notify other parts of your app that login has occurred

            } catch (error) {
                console.error('Authentication error:', error);
            }
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);
};

        export default useGoogleIdentityServices;
