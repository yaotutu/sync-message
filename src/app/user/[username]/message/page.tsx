import React from 'react';
import CardKeyForm from './CardKeyForm';

export default async function MessagePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    return <CardKeyForm username={username} />;
}