"use client";
import { useEffect, useState } from 'react';

export default function GitHubCallback() {
    const [currentUrl, setCurrentUrl] = useState('Loading...');
    const [debugInfo, setDebugInfo] = useState([]);

    useEffect(() => {
        // Set the current URL to avoid hydration mismatch
        setCurrentUrl(window.location.href);
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        const addDebugInfo = (message) => {
            console.log(message);
            setDebugInfo(prev => [...prev, message]);
        };
        
        addDebugInfo('GitHub callback page loaded');
        addDebugInfo(`URL params: ${window.location.search}`);
        addDebugInfo(`Code: ${code}`);
        addDebugInfo(`Error: ${error}`);
        
        if (window.opener) {
            addDebugInfo('Window opener exists, sending message to parent');
            
            if (code) {
                // Send success message to parent window
                window.opener.postMessage({
                    type: 'GITHUB_AUTH_SUCCESS',
                    code: code
                }, window.location.origin);
                
                addDebugInfo('Sent success message to parent');
            } else if (error) {
                // Send error message to parent window
                window.opener.postMessage({
                    type: 'GITHUB_AUTH_ERROR',
                    error: error
                }, window.location.origin);
                
                addDebugInfo('Sent error message to parent');
            }
            
            // Keep window open for debugging - comment out auto-close
            // setTimeout(() => {
            //     console.log('Closing popup window');
            //     window.close();
            // }, 2000);
        } else {
            addDebugInfo('No window opener, redirecting to home');
            // Fallback if not in popup - redirect to home
            window.location.href = '/';
        }
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl mb-4">Processing GitHub login...</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                
                <div className="mt-4 text-sm text-gray-600">
                    Debug Information:
                </div>
                <div className="mt-2 text-xs bg-gray-100 p-2 rounded max-w-md mx-auto">
                    <div>URL: {currentUrl}</div>
                    <div className="mt-2 text-left">
                        {debugInfo.map((info, index) => (
                            <div key={index}>{info}</div>
                        ))}
                    </div>
                </div>
                
                <button 
                    onClick={() => window.close()} 
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Close Window (for debugging)
                </button>
            </div>
        </div>
    );
}