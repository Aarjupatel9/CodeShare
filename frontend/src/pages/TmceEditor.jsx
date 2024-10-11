

import { Editor } from '@tinymce/tinymce-react';
import {
    socketIcon,
    addFileIcon
} from "../assets/svgs";
import { useEffect } from 'react';


var tinyApiKey = process.env.REACT_APP_TINYMCE_KEY;


export default function TmceEditor({ props }) {
    const { editorRef, inputFile, latestVersion, setSocketEnabled, tinyMceSaveHandler, handleOnEditorChange } = props;
    return (
        <Editor
            onInit={(evt, editor) => editorRef.current = editor}
            className="text-sm z-10 h-[100%] rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            apiKey={tinyApiKey}
            init={{
                selector: "textarea",
                plugins: 'socketTogglePlugin preview importcss searchreplace autolink   directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
                editimage_cors_hosts: ['picsum.photos'],
                menubar: 'file edit view insert format tools table help',
                toolbar: "addFileButton  | undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview |  print | pagebreak anchor codesample | ltr rtl",


                image_caption: true,
                quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                noneditable_class: 'mceNonEditable',
                toolbar_mode: 'sliding',
                contextmenu: 'link image table',
                // skin: useDarkMode ? 'oxide-dark' : 'oxide',
                // content_css: useDarkMode ? 'dark' : 'default',
                skin: 'oxide',
                content_css: 'default',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',


                tinycomments_mode: 'embedded',
                tinycomments_author: 'Aarju Patel',


                setup: (editor) => {
                    editor.ui.registry.addIcon("socketIcon", socketIcon)
                    editor.ui.registry.addButton("socketTogglePlugin", {
                        icon: "socketIcon",
                        tooltip: "Toggle realtime socket update ",
                        onAction: function () {
                            setSocketEnabled((prev) => !prev);
                        },
                    });


                    // add file button
                    editor.ui.registry.addIcon("addFileIcon", addFileIcon)
                    editor.ui.registry.addButton("addFileButton", {
                        icon: "addFileIcon",
                        tooltip: "Upload a file",
                        onAction: function () {
                            inputFile.current.click();
                        },
                    });
                },
                // save_onsavecallback: (e) => {
                //     tinyMceSaveHandler()
                // }
            }}
            onEditorChange={handleOnEditorChange}
            initialValue={latestVersion.data}
        />
    )
}