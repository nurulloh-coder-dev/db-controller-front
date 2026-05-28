# DB-Controller (Frontend)

This is the client-facing web application for the DB-Controller ecosystem. It provides a highly interactive, responsive, and visually driven dashboard that enables teams to manage database connections, audit infrastructure activity, and provision user permissions.

## 🎨 Implemented Features & Core Views (From Source)
* **Centralized Security Dashboard:** A comprehensive UI designed to handle multi-database infrastructure, allowing administrative users to manage credentials and monitor connection state across PostgreSQL, MySQL, and MongoDB instances.
* **Role-Based Access Management (RBAC):** Integrated UI views that adapt dynamically to enforce the *Principle of Least Privilege*. The dashboard restricts or exposes specific administration features based on individual team permissions.
* **Security & Audit Logs:** Dedicated interface elements to showcase audit histories and security compliance tracking.
* **Multilingual Routing Architecture (i18n):** Features a dynamic Client-side Language Selection Controller (`home.js`) supporting localized runtime contexts across English, Russian, and Uzbek languages.
* **Asynchronous UX Orchestration:** Implements intersection observers for fluid, physics-based scroll animations and decoupled modular UI interactions (`home.css`).

## 🛠️ Tech Stack & Architecture
* **Structural Blueprint:** Semantic **HTML5** tailored with decoupled `data-i18n` bindings for programmatic text substitution.
* **Styling Framework:** Pure, responsive **CSS3** utilizing advanced hardware-accelerated transforms (`translateY`), custom backdrop filters, fluid bezier keyframes, and modern grid/flex layouts.
* **Logic Client Engine:** Native **Vanilla JavaScript (ES6+)** orchestrating structural client-side actions, custom event listeners (`languageChanged`), and Intersection Observers to asynchronously animate system states on viewport entries.

## 🔗 Project Ecosystem
This frontend relies on the core processing engine to function. 
* View the main processing engine here: [DB-Controller Backend] (https://github.com/nurulloh-coder-dev/db-controller)
