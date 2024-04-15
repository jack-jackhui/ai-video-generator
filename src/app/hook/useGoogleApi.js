// hooks/useGoogleApi.js
import { useEffect } from 'react';

const useGoogleApi = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => initGoogleApi();
        document.body.appendChild(script);

        const initGoogleApi = () => {
            window.gapi.load('auth2', () => {
                window.gapi.auth2.init({
                    client_id: '1093324646306-ls0epdq7o8nfvhgq4dj3d0i1a3m59ncc.apps.googleusercontent.com',
                });
            });
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);
};

export default useGoogleApi;
