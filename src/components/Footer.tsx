'use client';

import { useState } from 'react';
import ContactModal from './ContactModal';

export default function Footer() {
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    return (
        <>
            <footer className="py-4 text-center text-gray-500">
                <p>© {new Date().getFullYear()} Sync Message. All rights reserved.</p>
            </footer>
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </>
    );
}