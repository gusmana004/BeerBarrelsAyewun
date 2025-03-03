CREATE DATABASE Beer_Barrels_Ayewun;

USE Beer_Barrels_Ayewun;

CREATE TABLE BARRELS(
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    liters INT NOT NULL,
    status ENUM('lleno','vacío') NOT NULL DEFAULT 'vacío',
    beer VARCHAR(100) NOT NULL,
    production_date DATE NOT NULL,
    locations_id INT,

);
 
CREATE TABLE LOCATIONS(
    id AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('bodega','evento','cliente') NOT NULL,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    description VARCHAR(300)
);

CREATE TABLE USERS(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('vendedor','productor','admin') NOT NULL DEFAULT 'vendedor', 
    registry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
