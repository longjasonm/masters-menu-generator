"use client";

import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FaDownload, FaShare } from 'react-icons/fa';
import Image from 'next/image';
import './App.css';

export default function Home() {
    const [menuTitle, setMenuTitle] = useState('Masters Club Dinner');
    const [menuDate, setMenuDate] = useState('April 10, 2023');
    const [appetizers, setAppetizers] = useState([
        { name: 'Pimento Cheese', description: 'Southern classic with sharp cheddar and pimentos' },
        { name: 'Georgia Peach Salad', description: 'Fresh peaches with mixed greens and vinaigrette' }
    ]);

    const [soup, setSoup] = useState([
        { name: 'Green Jacket Salad', description: 'Fresh greens with house dressing' },
    ]);
    const [mainCourses, setMainCourses] = useState([
        { name: 'Augusta National Clubhouse Burger', description: 'Premium beef with special sauce and fixings' },
        { name: 'Grilled Chicken', description: 'Herb-marinated chicken breast with lemon' }
    ]);
    const [desserts, setDesserts] = useState([
        { name: 'Georgia Peach Cobbler', description: 'Warm cobbler with vanilla ice cream' },
    ]);
    const [honorText, setHonorText] = useState('Served in Honor of Your Name Here');
    const menuRef = useRef(null);

    // Character limits
    const MAX_TITLE_LENGTH = 50;
    const MAX_DATE_LENGTH = 30;
    const MAX_DISH_NAME_LENGTH = 40;
    const MAX_DISH_DESCRIPTION_LENGTH = 100;
    const MAX_HONOR_TEXT_LENGTH = 80;

    // Sanitize input to prevent XSS
    const sanitizeInput = (input) => {
        if (typeof input !== 'string') return '';
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    };

    const handleTitleChange = (e) => {
        const sanitizedValue = sanitizeInput(e.target.value);
        setMenuTitle(sanitizedValue.slice(0, MAX_TITLE_LENGTH));
    };

    const handleDateChange = (e) => {
        const sanitizedValue = sanitizeInput(e.target.value);
        setMenuDate(sanitizedValue.slice(0, MAX_DATE_LENGTH));
    };

    const handleHonorTextChange = (e) => {
        const sanitizedValue = sanitizeInput(e.target.value);
        setHonorText(sanitizedValue.slice(0, MAX_HONOR_TEXT_LENGTH));
    };

    const handleItemNameChange = (index, value, section, setSection) => {
        const sanitizedValue = sanitizeInput(value);
        const newItems = [...section];
        newItems[index] = { ...newItems[index], name: sanitizedValue.slice(0, MAX_DISH_NAME_LENGTH) };
        setSection(newItems);
    };

    const handleItemDescriptionChange = (index, value, section, setSection) => {
        const sanitizedValue = sanitizeInput(value);
        const newItems = [...section];
        newItems[index] = { ...newItems[index], description: sanitizedValue.slice(0, MAX_DISH_DESCRIPTION_LENGTH) };
        setSection(newItems);
    };

    const addItem = (section, setSection) => {
        if (section.length >= 10) {
            alert('Maximum of 10 items allowed per section');
            return;
        }
        setSection([...section, { name: '', description: '' }]);
    };

    const removeItem = (index, section, setSection) => {
        if (section.length <= 1) {
            alert('At least one item is required');
            return;
        }
        const newItems = [...section];
        newItems.splice(index, 1);
        setSection(newItems);
    };

    const downloadAsPDF = () => {
        const input = menuRef.current;
        html2canvas(input, {
            scale: 1.75,
            useCORS: true,
            logging: false,
            width: 8.5 * 96,
            height: 11 * 96,
            windowWidth: 8.5 * 96,
            windowHeight: 11 * 96,
            imageTimeout: 0,
            removeContainer: true,
            backgroundColor: '#ffffff'
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const pdf = new jsPDF('p', 'in', 'letter');
            const pdfWidth = 8.5;
            const pdfHeight = 11;
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = 0;
            const imgY = 0;

            pdf.addImage(imgData, 'JPEG', imgX, imgY, pdfWidth, pdfHeight);
            pdf.save('masters-menu.pdf');
        });
    };

    const downloadAsPNG = () => {
        const input = menuRef.current;
        html2canvas(input, {
            scale: 1.75,
            useCORS: true,
            logging: false,
            width: 8.5 * 96,
            height: 11 * 96,
            windowWidth: 8.5 * 96,
            windowHeight: 11 * 96,
            imageTimeout: 0,
            removeContainer: true,
            backgroundColor: '#ffffff'
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            link.download = 'masters-menu.jpg';
            link.href = imgData;
            link.click();
        });
    };

    const shareMenu = async () => {
        try {
            const input = menuRef.current;
            const canvas = await html2canvas(input, {
                scale: 1.75,
                useCORS: true,
                logging: false,
                width: 8.5 * 96,
                height: 11 * 96,
                windowWidth: 8.5 * 96,
                windowHeight: 11 * 96,
                imageTimeout: 0,
                removeContainer: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const blob = await (await fetch(imgData)).blob();

            // Check if we're on iOS Safari
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            if (navigator.share && !(isIOS && isSafari && window.location.protocol === 'http:')) {
                try {
                    await navigator.share({
                        title: 'My Masters Dinner Menu',
                        files: [new File([blob], 'masters-menu.jpg', { type: 'image/jpeg' })],
                    });
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Error sharing:', error);
                        // Fallback to download if share fails
                        const link = document.createElement('a');
                        link.download = 'masters-menu.jpg';
                        link.href = imgData;
                        link.click();
                    }
                }
            } else {
                // Fallback to download
                const link = document.createElement('a');
                link.download = 'masters-menu.jpg';
                link.href = imgData;
                link.click();
            }
        } catch (error) {
            console.error('Error preparing share:', error);
            // Fallback to download if anything fails
            const link = document.createElement('a');
            link.download = 'masters-menu.jpg';
            link.href = imgData;
            link.click();
        }
    };

    return (
        <div className="app-container">
            <div className="editor-container">
                <h1>Create Your Masters Dinner Menu</h1>

                <div className="menu-editor">
                    <div className="section">
                        <h3>Menu Title</h3>
                        <div className="menu-item-edit">
                            <input
                                type="text"
                                value={menuTitle}
                                onChange={handleTitleChange}
                                placeholder="Menu Title"
                                className="title-input"
                                maxLength={MAX_TITLE_LENGTH}
                            />
                            <span className="char-count">({menuTitle.length}/{MAX_TITLE_LENGTH})</span>
                        </div>
                    </div>

                    <div className="section">
                        <h3>Date</h3>
                        <div className="menu-item-edit">
                            <input
                                type="text"
                                value={menuDate}
                                onChange={handleDateChange}
                                placeholder="Date"
                                className="title-input"
                                maxLength={MAX_DATE_LENGTH}
                            />
                            <span className="char-count">({menuDate.length}/{MAX_DATE_LENGTH})</span>
                        </div>
                    </div>

                    <div className="section">
                        <h3>Appetizers</h3>
                        {appetizers.map((item, index) => (
                            <div key={`app-${index}`} className="menu-item-edit">
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleItemNameChange(index, e.target.value, appetizers, setAppetizers)}
                                    placeholder="Dish name"
                                    className="dish-name-input"
                                    maxLength={MAX_DISH_NAME_LENGTH}
                                />
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleItemDescriptionChange(index, e.target.value, appetizers, setAppetizers)}
                                    placeholder="Description"
                                    className="dish-description-input"
                                    maxLength={MAX_DISH_DESCRIPTION_LENGTH}
                                />
                                <button onClick={() => removeItem(index, appetizers, setAppetizers)}>Remove</button>
                            </div>
                        ))}
                        <button onClick={() => addItem(appetizers, setAppetizers)}>Add Appetizer</button>
                    </div>

                    <div className="section">
                        <h3>Soup/Salad</h3>
                        {soup.map((item, index) => (
                            <div key={`side-${index}`} className="menu-item-edit">
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleItemNameChange(index, e.target.value, soup, setSoup)}
                                    placeholder="Dish name"
                                    className="dish-name-input"
                                    maxLength={MAX_DISH_NAME_LENGTH}
                                />
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleItemDescriptionChange(index, e.target.value, soup, setSoup)}
                                    placeholder="Description"
                                    className="dish-description-input"
                                    maxLength={MAX_DISH_DESCRIPTION_LENGTH}
                                />
                                <button onClick={() => removeItem(index, soup, setSoup)}>Remove</button>
                            </div>
                        ))}
                        <button onClick={() => addItem(soup, setSoup)}>Add Side</button>
                    </div>

                    <div className="section">
                        <h3>Main Courses</h3>
                        {mainCourses.map((item, index) => (
                            <div key={`main-${index}`} className="menu-item-edit">
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleItemNameChange(index, e.target.value, mainCourses, setMainCourses)}
                                    placeholder="Dish name"
                                    className="dish-name-input"
                                    maxLength={MAX_DISH_NAME_LENGTH}
                                />
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleItemDescriptionChange(index, e.target.value, mainCourses, setMainCourses)}
                                    placeholder="Description"
                                    className="dish-description-input"
                                    maxLength={MAX_DISH_DESCRIPTION_LENGTH}
                                />
                                <button onClick={() => removeItem(index, mainCourses, setMainCourses)}>Remove</button>
                            </div>
                        ))}
                        <button onClick={() => addItem(mainCourses, setMainCourses)}>Add Main Course</button>
                    </div>

                    <div className="section">
                        <h3>Desserts</h3>
                        {desserts.map((item, index) => (
                            <div key={`dessert-${index}`} className="menu-item-edit">
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleItemNameChange(index, e.target.value, desserts, setDesserts)}
                                    placeholder="Dish name"
                                    className="dish-name-input"
                                    maxLength={MAX_DISH_NAME_LENGTH}
                                />
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleItemDescriptionChange(index, e.target.value, desserts, setDesserts)}
                                    placeholder="Description"
                                    className="dish-description-input"
                                    maxLength={MAX_DISH_DESCRIPTION_LENGTH}
                                />
                                <button onClick={() => removeItem(index, desserts, setDesserts)}>Remove</button>
                            </div>
                        ))}
                        <button onClick={() => addItem(desserts, setDesserts)}>Add Dessert</button>
                    </div>

                    <div className="section">
                        <h3>In Honor Of</h3>
                        <div className="menu-item-edit">
                            <input
                                type="text"
                                value={honorText}
                                onChange={handleHonorTextChange}
                                placeholder="Honoree name"
                                className="title-input"
                                maxLength={MAX_HONOR_TEXT_LENGTH}
                            />
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <h3>Export Menu</h3>
                    <div className="button-container">
                        <button onClick={downloadAsPDF} className="action-button">
                            <FaDownload className="button-icon" /> PDF
                        </button>
                    </div>
                    <div className="button-container">
                        <button onClick={downloadAsPNG} className="action-button">
                            <FaDownload className="button-icon" /> Image
                        </button>
                    </div>
                    <div className="button-container">
                        <button onClick={shareMenu} className="action-button">
                            <FaShare className="button-icon" /> Share
                        </button>
                    </div>
                </div>
            </div>

            <div className="preview-container">
                <div className="menu-preview" ref={menuRef}>
                    <div className='menu-container'>
                        <div className="menu-header">
                            <Image
                                src="/logo.png"
                                alt="Masters Logo"
                                className="masters-logo"
                                width={100}
                                height={100}
                                priority
                                unoptimized
                            />
                            <h2>{menuTitle}</h2>
                            <p className="menu-date">{menuDate}</p>
                        </div>
                        <div className="menu-divider"></div>

                        <div className="menu-section">
                            <ul>
                                {appetizers.map((item, index) => (
                                    <li key={`app-preview-${index}`}>
                                        <div className="dish-name">{item.name}</div>
                                        <div className="dish-description">{item.description}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="menu-divider"></div>
                        <div className="menu-section">
                            <ul>
                                {soup.map((item, index) => (
                                    <li key={`side-preview-${index}`}>
                                        <div className="dish-name">{item.name}</div>
                                        <div className="dish-description">{item.description}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="menu-divider"></div>
                        <div className="menu-section">
                            <ul>
                                {mainCourses.map((item, index) => (
                                    <li key={`main-preview-${index}`}>
                                        <div className="dish-name">{item.name}</div>
                                        <div className="dish-description">{item.description}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="menu-divider"></div>

                        <div className="menu-section">
                            <ul>
                                {desserts.map((item, index) => (
                                    <li key={`dessert-preview-${index}`}>
                                        <div className="dish-name">{item.name}</div>
                                        <div className="dish-description">{item.description}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="menu-divider"></div>
                        <div className="honor-section">
                            <p>{honorText}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}