import { Dropdown } from "flowbite-react";
import { CustomFlowbiteTheme } from "flowbite-react";
import * as xlsx from 'xlsx';


export const dropdownTheme = {
    base: 'bg-red-500 font-red-200 text-black rounded-lg shadow-lg', // Dropdown background and text color
    colors: 'bg-red-500 font-red-200 text-black rounded-lg shadow-lg', // Dropdown background and text color
    content: 'py-2 bg-gray-200 text-black font-bold', // Background and text color for dropdown content
    item: {
        base: 'text-gray-200 hover:bg-gray-900 hover:text-gray-900', // Default item styles
        active: 'bg-blue-600 text-gray-900', // Active item styles
        disabled: 'opacity-50 cursor-not-allowed text-gray-400', // Disabled item styles
    },
};
