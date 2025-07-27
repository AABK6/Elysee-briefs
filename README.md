# Élysée Briefs

Welcome to the Élysée Briefs project. This open-source initiative provides a searchable and accessible web interface to a unique collection of political briefing notes and memos from the French Presidency.

The goal of this project is to make these historical documents easily explorable for journalists, researchers, and the public.

**The live application is hosted at [elyseebriefs.org](https://elyseebriefs.org).**

<!-- Add a screenshot of the application's home page here -->

## The Project: A Glimpse into French Politics

This project's primary purpose is to provide unprecedented access to a collection of over 300 internal briefing notes from the office of the French President (the "Élysée"). These documents, spanning from 2014 to 2017, offer a unique and unfiltered look into the thinking and political analysis that informed the highest levels of the French government.

The memos were mainly authored by the President's polling and political senior advisor at the time, Adrien Abecassis. Some were authored collectively. They cover a wide range of topics, including:

*   **Public Opinion Analysis:** Detailed breakdowns of polling data on key issues, political figures, and government policies.
*   **Political Strategy:** Recommendations for messaging, communication strategies, and political positioning.
*   **Legislative and Reform Analysis:** Briefings on public perception of major economic and social reforms.
*   **Electoral Analysis:** Insights into voter behavior, electoral dynamics, and campaign strategies, particularly concerning European elections.

By making these documents fully searchable and accessible through a modern web interface at [elyseebriefs.org](https://elyseebriefs.org), this project aims to serve as a resource for journalists, historians, researchers, and citizens interested in contemporary French politics. It is a tool for transparency and a window into the data and analysis that shaped public policy.

This repository contains the full source code for the web application, the data processing scripts, and the entire collection of original documents.

## Features

*   **Full-Text Search:** Instantly search the content of all memos.
*   **Advanced Filtering:** Narrow down results by date, sender, recipient, and keywords.
*   **Bilingual Interface:** The entire interface is available in both **French** and **English**.
*   **Direct Document Access:** Link directly to the original source documents for verification and deeper analysis.
*   **Responsive Design:** Fully accessible on both desktop and mobile devices.

You can try these features on the live site: [elyseebriefs.org](https://elyseebriefs.org).

## Tech Stack

This project is built with a combination of modern web technologies and data processing scripts:

*   **Frontend:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
*   **Data Processing:** [Python](https://www.python.org/) for parsing and extracting information from document files.
*   **Hosting:** Deployed on [Vercel](https://vercel.com/).

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/elysee-briefs.git
    cd elysee-briefs
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the Python environment and install dependencies.** It is recommended to use a virtual environment.
    ```bash
    # Create a virtual environment
    python -m venv .venv
    # Activate it (Windows)
    .venv\Scripts\activate
    # Or (macOS/Linux)
    # source .venv/bin/activate

    # Install Python packages
    pip install python-docx unidecode
    ```

4.  **Process the data:**
    Run the data extraction script to generate the `memo_data.json` file from the source documents.
    ```bash
    python update_memos.py
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the local version of the application.

## Author

This project was created and is maintained by **Adrien Abecassis**.

For more information about the author and other projects, please visit [adrienabecassis.fr](httpss://adrienabecassis.fr).

## License

This project is licensed under the MIT License. See the LICENSE file for more details.