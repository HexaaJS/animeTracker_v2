import React from 'react'
import { Heart } from 'lucide-react';
import '../styles/Footer.css';

export default function Footer() {
    return (
        <footer>

            <div className="footer-container">
                <div className="title">
                    Made with <Heart color='red' size={16} /> by HexaJS
                </div>
            </div>

        </footer>
    )
}
