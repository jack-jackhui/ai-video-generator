"use client";
import React from 'react';
import { Button, Card, CardBody } from "@nextui-org/react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Card className="max-w-lg w-full">
                        <CardBody className="text-center space-y-4">
                            <h2 className="text-2xl font-bold text-danger">
                                Something went wrong
                            </h2>
                            <p className="text-gray-500">
                                We apologize for the inconvenience. Please try refreshing the page.
                            </p>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="text-left text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-48">
                                    <summary className="cursor-pointer font-medium">
                                        Error Details
                                    </summary>
                                    <pre className="mt-2 whitespace-pre-wrap">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}
                            <div className="flex gap-4 justify-center">
                                <Button
                                    color="primary"
                                    onPress={() => window.location.reload()}
                                >
                                    Refresh Page
                                </Button>
                                <Button
                                    color="secondary"
                                    variant="bordered"
                                    onPress={this.handleReset}
                                >
                                    Try Again
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
