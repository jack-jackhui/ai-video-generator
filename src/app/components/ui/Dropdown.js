"use client";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button
} from '@nextui-org/react';

export default function VideoDropdown({ label, selectedItem, onChange, options, fullWidth = false }) {
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button variant="bordered" className={`bg-transparent border-white ${fullWidth ? 'w-full' : ''}`}>
                    {selectedItem.label || `Select ${label}`}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label={`${label} Actions`}
                className="dark:text-white bg-transparent rounded-lg w-full md:w-auto text-sm md:text-base overflow-y-auto"
            >
                {options.map(option => {
                    const key = Object.keys(option)[0];
                    const value = option[key];
                    const displayLabel = value.startsWith('zh') ? `中文: ${key}` : key;
                    return (
                        <DropdownItem
                            className="overflow-y-auto"
                            key={value}
                            onClick={() => onChange({ label: key, value })}
                        >
                            {displayLabel}
                        </DropdownItem>
                    );
                })}
            </DropdownMenu>
        </Dropdown>
    );
}
