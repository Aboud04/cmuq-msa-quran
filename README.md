# CMUQ MSA Quran Context App

![App Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A lightweight web application designed for the **CMU-Q Muslim Student Association**. This tool allows users to discover random ayahs from the Quran and dynamically load surrounding verses to understand the full context.

## 🌟 Features

* **Random Ayah Generation:** Instantly fetches a random verse from the Quran.
* **Context Awareness:** Automatically loads the verse immediately preceding and following the selected ayah.
* **Dynamic Expansion:** "Load Previous" and "Load Next" buttons allow users to expand the recitation context infinitely within the Surah.
* **Translations:** Uses *Sahih International* (ID: 20) for clear English meanings.
* **CMUQ Branding:** Styled with the Tartan Red/Maroon palette and MSA logo.
* **Responsive Design:** Works seamlessly on mobile and desktop.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **API:** [Quran.com API v4](https://quran.api-docs.io/v4/)
* **Fonts:** [Amiri](https://fonts.google.com/specimen/Amiri) (Arabic) & [Inter](https://fonts.google.com/specimen/Inter) (UI)

## 🚀 How to Run

Since this is a static web application, no backend server is required.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/quran-context-app.git](https://github.com/yourusername/quran-context-app.git)
    ```
2.  **Open the project:**
    Navigate to the folder and open `index.html` in your browser.

**VS Code Users:**
* Install the "Live Server" extension.
* Right-click `index.html` and select "Open with Live Server".

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the UI or add new features (like audio recitation or Tafsir):

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

##  Acknowledgments

* Powered by the incredible [Quran.com API](https://quran.com/).
* Developed for the CMU-Q Muslim Student Association.
