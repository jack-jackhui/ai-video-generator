import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import VideoEngineSelector from '@/app/components/video/VideoEngineSelector';

vi.mock('@nextui-org/react', () => ({
    RadioGroup: ({ children, label, value, onValueChange }) => React.createElement(
        'label',
        null,
        label,
        React.createElement(
            'select',
            {
                'aria-label': label,
                value,
                onChange: (event) => onValueChange(event.target.value),
            },
            children
        )
    ),
    Radio: ({ children, value }) => React.createElement('option', { value }, children),
}));

describe('VideoEngineSelector', () => {
    it('offers stock, Azure Sora 2, and Studio engines', () => {
        render(React.createElement(VideoEngineSelector, { value: 'default', onChange: vi.fn() }));

        expect(screen.getByRole('option', { name: 'Stock Video' })).toHaveValue('default');
        expect(screen.getByRole('option', { name: 'OpenAI Sora 2' })).toHaveValue('sora');
        expect(screen.getByRole('option', { name: 'AI Video Studio' })).toHaveValue('studio');
    });

    it('reports Sora selection using the established backend route key', () => {
        const onChange = vi.fn();
        render(React.createElement(VideoEngineSelector, { value: 'default', onChange }));

        fireEvent.change(screen.getByLabelText('Select Video Engine'), {
            target: { value: 'sora' },
        });

        expect(onChange).toHaveBeenCalledWith('sora');
    });
});
