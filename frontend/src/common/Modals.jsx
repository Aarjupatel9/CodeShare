import React from 'react';
import { closeIcon, profilePicture } from "../assets/svgs";

const Modal = ({ onClose, children, title }) => {
    return (
        <div className="fixed inset-0 z-[50000] flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col bg-white rounded shadow-lg max-w-lg w-full p-2">
                <div className="flex flex-row justify-">
                    <div className="text-xl font-bold w-full">{title}</div>
                    <button
                        onClick={onClose}
                        className="flex-end text-xxl"
                    >
                        {closeIcon}
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export const HelpMoedal = ({ onClose }) => {
    return (<Modal title={"Help & Support"} onClose={onClose}>
        <div className="flex flex-col justify-start gap-2">
            <div className="flex flex-col justify-start p-2">
                Email address : <a href="mailto:developer.codeshare@gmail.com" className="text-blue-500"> developer.codeshare@gmail.com</a>
            </div>
            <div className="mt-4 text-xl font-semibold">Code Share feature</div>
            <div className="">
                <div>Content Sharing</div>
                <div>Files Sharing (Login required)</div>
                <div>Can play games</div>
                <div>Other premium features</div>
            </div>
        </div>

    </Modal>
    );
};

export const UserProfileModal = ({ onClose, currUser, navigate }) => {
    const [copied, setCopied] = React.useState(false);
    
    const copyUserId = () => {
        navigator.clipboard.writeText(currUser._id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal onClose={onClose} title={"User Profile"}>
            <div className="flex p-2 w-full">
                {/* Profile Image */}
                <div className="w-1/3 flex items-center justify-center">
                    {profilePicture}
                </div>

                {/* Profile Info */}
                <div className="w-2/3 pl-1">
                    <h2 className="text-lg font-semibold">{currUser.username}</h2>
                    <p className="text-gray-600 text-sm">{currUser.email}</p>
                    
                    {/* User ID with Copy Button */}
                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 font-medium mb-1">User ID (for auctions)</p>
                                <p className="text-xs font-mono text-gray-800 truncate" title={currUser._id}>
                                    {currUser._id}
                                </p>
                            </div>
                            <button
                                onClick={copyUserId}
                                className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition"
                            >
                                {copied ? '✓ Copied!' : '📋 Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="mt-4">
                        <button className="text-blue-500 hover:underline text-sm" onClick={() => { navigate("/auth/forgetpassword"); }}>
                            Reset Password?
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};