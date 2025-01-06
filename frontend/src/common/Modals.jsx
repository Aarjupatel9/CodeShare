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
                    <p className="text-gray-600">{currUser.email}</p>
                    <p className="text-gray-600">{currUser.bio}</p>

                    {/* Links */}
                    <div className="mt-4">
                        <button className="text-blue-500 hover:underline" onClick={() => { navigate("/auth/forgetpassword"); }}>Reset Password?
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};