import React from "react";
import {
    Dialog,
} from "@material-tailwind/react";


export default function ModalCustom({ children, handler, handleOpen, open }) {
    
    
    return (
        <>
            <div onClick={handleOpen} variant="gradient">
                {handler}
            </div>
            <Dialog onClick={handleOpen} open={open} handler={handleOpen} className="dialog-wrapper h-screen bg-transparent 
                flex flex-col justify-center items-center " >
                {children}
            </Dialog>
        </>
    );
}