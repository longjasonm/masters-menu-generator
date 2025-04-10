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

    // Track whether fields have been edited
    const [isTitleEdited, setIsTitleEdited] = useState(false);
    const [isDateEdited, setIsDateEdited] = useState(false);
    const [isHonorTextEdited, setIsHonorTextEdited] = useState(false);
    const [editedItems, setEditedItems] = useState({
        appetizers: [],
        soup: [],
        mainCourses: [],
        desserts: []
    });

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
        const originalTransform = input.style.transform;
        const menuContainer = input.querySelector('.menu-container');

        // Add export class for proper dimensions
        input.classList.add('export');
        menuContainer.classList.add('export');

        // Remove any scaling for capture
        input.style.transform = 'none';

        html2canvas(input, {
            scale: 2,
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
            // Restore original transform and remove export class
            input.style.transform = originalTransform;
            input.classList.remove('export');
            menuContainer.classList.remove('export');

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });

            pdf.addImage(imgData, 'JPEG', 0, 0, 8.5, 11);
            pdf.save('masters-menu.pdf');
        });
    };

    const downloadAsPNG = () => {
        const input = menuRef.current;
        const originalTransform = input.style.transform;

        // Remove any scaling for capture
        input.style.transform = 'none';

        html2canvas(input, {
            scale: 2,
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
            // Restore original transform
            input.style.transform = originalTransform;

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // Create modal overlay
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '1000';

            // Create image container
            const imgContainer = document.createElement('div');
            imgContainer.style.position = 'relative';
            imgContainer.style.maxWidth = '90%';
            imgContainer.style.maxHeight = '90%';

            // Create image
            const img = document.createElement('img');
            img.src = imgData;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'contain';

            // Create close button
            const closeButton = document.createElement('button');
            closeButton.innerHTML = '×';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '-40px';
            closeButton.style.right = '0';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.color = 'white';
            closeButton.style.fontSize = '30px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.padding = '5px 10px';

            // Add click handler to close modal
            closeButton.onclick = () => {
                document.body.removeChild(modal);
            };

            // Add click handler to modal background to close
            modal.onclick = (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            };

            // Assemble and add to document
            imgContainer.appendChild(img);
            imgContainer.appendChild(closeButton);
            modal.appendChild(imgContainer);
            document.body.appendChild(modal);
        });
    };

    const shareMenu = async () => {
        try {
            const input = menuRef.current;
            const menuContainer = input.querySelector('.menu-container');

            // Add export class for proper dimensions
            input.classList.add('export');
            menuContainer.classList.add('export');

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

            // Remove export class
            input.classList.remove('export');
            menuContainer.classList.remove('export');

            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            const blob = await (await fetch(imgData)).blob();

            // Check if we're on iOS Safari
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            if (navigator.share && !(isIOS && isSafari && window.location.protocol === 'http:')) {
                try {
                    await navigator.share({
                        title: 'My Masters Dinner Menu',
                        text: 'Make yours here: ' + window.location.href,
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

    const handleTitleFocus = (e) => {
        if (!isTitleEdited) {
            setMenuTitle('');
            setIsTitleEdited(true);
        }
    };

    const handleDateFocus = (e) => {
        if (!isDateEdited) {
            setMenuDate('');
            setIsDateEdited(true);
        }
    };

    const handleHonorTextFocus = (e) => {
        if (!isHonorTextEdited) {
            setHonorText('');
            setIsHonorTextEdited(true);
        }
    };

    const handleItemNameFocus = (index, section, setSection, sectionName) => {
        if (!editedItems[sectionName]?.includes(index)) {
            const newItems = [...section];
            newItems[index] = { ...newItems[index], name: '' };
            setSection(newItems);
            setEditedItems(prev => ({
                ...prev,
                [sectionName]: [...(prev[sectionName] || []), index]
            }));
        }
    };

    const handleItemDescriptionFocus = (index, section, setSection, sectionName) => {
        if (!editedItems[sectionName]?.includes(index)) {
            const newItems = [...section];
            newItems[index] = { ...newItems[index], description: '' };
            setSection(newItems);
            setEditedItems(prev => ({
                ...prev,
                [sectionName]: [...(prev[sectionName] || []), index]
            }));
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
                                onFocus={handleTitleFocus}
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
                                onFocus={handleDateFocus}
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
                                    onFocus={() => handleItemNameFocus(index, appetizers, setAppetizers, 'appetizers')}
                                    placeholder="Dish name"
                                    className="dish-name-input"
                                    maxLength={MAX_DISH_NAME_LENGTH}
                                />
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleItemDescriptionChange(index, e.target.value, appetizers, setAppetizers)}
                                    onFocus={() => handleItemDescriptionFocus(index, appetizers, setAppetizers, 'appetizers')}
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
                                    onFocus={() => handleItemNameFocus(index, soup, setSoup, 'soup')}
                                    placeholder="Dish name"
                                    className="dish-name-input"
                                    maxLength={MAX_DISH_NAME_LENGTH}
                                />
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleItemDescriptionChange(index, e.target.value, soup, setSoup)}
                                    onFocus={() => handleItemDescriptionFocus(index, soup, setSoup, 'soup')}
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
                                    onFocus={() => handleItemNameFocus(index, mainCourses, setMainCourses, 'mainCourses')}
                                    placeholder="Dish name"
                                    className="dish-name-input"
                                    maxLength={MAX_DISH_NAME_LENGTH}
                                />
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleItemDescriptionChange(index, e.target.value, mainCourses, setMainCourses)}
                                    onFocus={() => handleItemDescriptionFocus(index, mainCourses, setMainCourses, 'mainCourses')}
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
                                    onFocus={() => handleItemNameFocus(index, desserts, setDesserts, 'desserts')}
                                    placeholder="Dish name"
                                    className="dish-name-input"
                                    maxLength={MAX_DISH_NAME_LENGTH}
                                />
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleItemDescriptionChange(index, e.target.value, desserts, setDesserts)}
                                    onFocus={() => handleItemDescriptionFocus(index, desserts, setDesserts, 'desserts')}
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
                                onFocus={handleHonorTextFocus}
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