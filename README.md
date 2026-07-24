# ⚡ LLM Tuner

> A beautiful, intuitive, and provider-agnostic GUI for tweaking, managing, and optimizing local Large Language Models.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg)](https://tailwindcss.com/)

---

## 📖 The Origin Story

The idea for LLM Tuner was born out of a personal frustration. After accidentally losing 20GB of downloaded AI models and wrestling with opaque command-line tools, I discovered Ollama’s powerful but hidden `Modelfile` system. I realized I could create fully customized, "tweaked" versions of my models that applied specific parameters and system prompts while taking up only **1 kilobyte** of additional storage. 

However, doing this via the terminal was tedious, error-prone, and inaccessible to many. I built LLM Tuner to bridge that gap—transforming a complex, text-based workflow into a beautiful, intuitive, and accessible graphical interface. 

---

## ✨ Key Features

- **Zero-Bloat Customization:** Create unlimited "Custom Config" versions of your base models. Each tweak takes up ~1 KB of storage by sharing the underlying model weights.
- **Live Modelfile Preview:** Watch your parameter adjustments instantly generate the exact `Modelfile` syntax, demystifying how local LLMs work.
- **Intelligent Dashboard:** Clear, high-contrast visibility into your system status, VRAM usage, and installed models.
- **Provider Agnostic Architecture:** Built with separation of concerns. Currently optimized for Ollama, with a codebase designed to easily support `llama.cpp` and LM Studio in the future.
- **Hardware Awareness:** Smart defaults and recommendations to prevent CPU spillover and maximize your GPU's potential.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS (v4)
- **Backend Integration:** Native Fetch API communicating directly with the local Ollama REST API (`localhost:11434`)

---

## 🚀 Getting Started

Follow these steps to get LLM Tuner running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17 or higher)
- [Ollama](https://ollama.com/) installed and running in the background.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mahdiboy98/llm-tuner.git
   cd llm-tuner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a file named `.env.local` in the root directory and add your Ollama URL (default is shown below):
   ```env
   NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
   ```
   *(Note: Change the port here if you run Ollama on a custom port).*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🤝 Contributing

Contributions, issues, and feature requests are highly welcome! This project was built to solve a real problem, and community feedback is the best way to make it better. 

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
