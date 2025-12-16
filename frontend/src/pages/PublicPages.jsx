import React from 'react';
import MainPage from './MainPage';
import AdSlot from '../components/ads/AdSlot';

export default function PublicPages() {


    return (
        <>
            <div className="w-full max-w-4xl mx-auto mt-4 px-2">
                <AdSlot />
            </div>
            <MainPage user={null} />
            <div className="w-full max-w-4xl mx-auto my-6 px-2">
                <AdSlot />
            </div>
        </>
    );
}