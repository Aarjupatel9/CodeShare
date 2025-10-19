import { Editor } from '@tinymce/tinymce-react';
import {
    socketIcon,
    addFileIcon
} from "../assets/svgs";
import { useEffect } from 'react';

var tinyApiKey = process.env.REACT_APP_TINYMCE_KEY;


export default function TmceEditor({ props }) {
    const { editorRef, inputFile, latestVersion, setSocketEnabled, saveData, handleOnEditorChange } = props;
    return (
        <Editor
            tinymceScriptSrc='/tinymce/tinymce.min.js'
            onInit={(evt, editor) => editorRef.current = editor}
            className="text-sm z-10 h-[100%] rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            apiKey={tinyApiKey}
            licenseKey={"gpl"}
            init={{
                selector: "textarea",
                plugins: 'preview importcss searchreplace autolink directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
                editimage_cors_hosts: ['picsum.photos'],
                menubar: 'file edit view insert format tools table help',
                
                // Compact toolbar - single scrollable row
                toolbar: 'socketTogglePlugin | undo redo | bold italic underline strikethrough | fontfamily fontsize forecolor backcolor | align numlist bullist outdent indent | link image table | blocks | code fullscreen preview | removeformat',
                toolbar_mode: 'scrolling',  // Single row, horizontally scrollable
                
                // Mobile-friendly selection toolbar with essential editing actions
                quickbars_selection_toolbar: 'bold italic underline | h2 h3 | quicklink | copy cut paste selectall',
                
                // Better context menu with more options
                contextmenu: 'copy cut paste | link image table | selectall',
                
                image_caption: true,
                noneditable_class: 'mceNonEditable',
                
                // Enable mobile-friendly options - compact toolbar
                mobile: {
                  menubar: false,  // Hide menubar on mobile to save space
                  toolbar_mode: 'scrolling',  // Scrollable single row
                  // Compact toolbar with only essential tools
                  toolbar: 'socketTogglePlugin | undo redo | bold italic | link | bullist numlist | blocks | fullscreen',
                  quickbars_selection_toolbar: 'bold italic underline | h2 h3 | copy cut paste | selectall | quicklink',
                  quickbars_insert_toolbar: false,  // Disable insert quickbar
                },
                // skin: useDarkMode ? 'oxide-dark' : 'oxide',
                // content_css: useDarkMode ? 'dark' : 'default',
                skin: 'oxide',
                content_css: 'default',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',

                tinycomments_mode: 'embedded',
                tinycomments_author: 'Aarju Patel',

                setup: (editor) => {
                    // Socket toggle button
                    editor.ui.registry.addIcon("socketIcon", socketIcon)
                    editor.ui.registry.addButton("socketTogglePlugin", {
                        icon: "socketIcon",
                        tooltip: "Toggle realtime socket update",
                        onAction: function () {
                            setSocketEnabled((prev) => !prev);
                        },
                    });

                    // Add Copy button
                    editor.ui.registry.addButton("copy", {
                        text: "Copy",
                        icon: "copy",
                        tooltip: "Copy",
                        onAction: function () {
                            editor.execCommand('copy');
                        },
                    });

                    // Add Cut button
                    editor.ui.registry.addButton("cut", {
                        text: "Cut",
                        icon: "cut",
                        tooltip: "Cut",
                        onAction: function () {
                            editor.execCommand('cut');
                        },
                    });

                    // Add Paste button
                    editor.ui.registry.addButton("paste", {
                        text: "Paste",
                        icon: "paste",
                        tooltip: "Paste",
                        onAction: function () {
                            editor.execCommand('paste');
                        },
                    });

                    // Add Select All button
                    editor.ui.registry.addButton("selectall", {
                        text: "Select All",
                        icon: "select-all",
                        tooltip: "Select All",
                        onAction: function () {
                            editor.execCommand('SelectAll');
                        },
                    });
                },
                // save_onsavecallback: (e) => {
                //   saveData()
                // }
            }}
            onEditorChange={handleOnEditorChange}
            initialValue={latestVersion.data}
        />
    )
}