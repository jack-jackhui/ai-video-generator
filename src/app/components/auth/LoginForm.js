"use client";
import React from 'react';
import { Input, Checkbox, Link } from "@nextui-org/react";
import { MailIcon } from '../MailIcon.jsx';
import { LockIcon } from '../LockIcon.jsx';

export function LoginForm({
    formData,
    setFormData,
    formErrors,
    isSignUp,
    onPasswordReset
}) {
    return (
        <div className="flex flex-col gap-4">
            <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoFocus
                endContent={<MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                label="Email"
                placeholder="Enter your email"
                variant="bordered"
                isInvalid={!!formErrors.email || !!formErrors.username}
            />
            {formErrors.username && <p className="text-red-500">{formErrors.username}</p>}
            {formErrors.email && <p className="text-red-500">{formErrors.email}</p>}
            <Input
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                endContent={<LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
                label="Password"
                placeholder="Enter your password"
                type="password"
                variant="bordered"
            />
            {formErrors.password && <p className="text-red-500">{formErrors.password}</p>}
            {formErrors.password1 && <p className="text-red-500">{formErrors.password1}</p>}
            {formErrors.password2 && <p className="text-red-500">{formErrors.password2}</p>}

            {isSignUp ? (
                <Checkbox defaultSelected size="sm">
                    I agree to the <Link href="#" size="sm">Terms of Service</Link> and <Link href="#" size="sm">Privacy Policy</Link>
                </Checkbox>
            ) : (
                <div className="flex py-2 px-1 justify-between">
                    <Checkbox size="sm">Remember me</Checkbox>
                    <Link color="primary" href="#" size="sm" onClick={onPasswordReset}>
                        Forgot password?
                    </Link>
                </div>
            )}
        </div>
    );
}
