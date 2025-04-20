# 🧠 React Mind Map Application

A minimalist yet powerful mind mapping web application built with React. Create, connect, and organize your thoughts visually with this interactive tool. ✨

## ✅ Features

- **Add & Connect Nodes**: Create nodes and establish relationships between them with curved connection lines
- **Drag & Drop**: Manually position nodes using drag and drop functionality
- **Edit Node Content**: Click to edit node titles and content
- **Custom Node Colors**: Choose from predefined colors or pick a custom color for each node
- **Checklist Mode**: Convert any node into a checklist item that can be checked off
- **Beautiful Connections**: Curved bezier connections between nodes with animated dashed lines
- **Zoom & Pan**: Navigate your mind map with intuitive zoom and pan controls
- **LocalStorage Persistence**: Automatically saves your mind map in the browser
- **Export to Image**: Download your mind map as a PNG image

### ⭐ New Features

- **🎮 Gamification (Brain XP System)**: Earn XP by creating nodes, connecting ideas, and completing checklist items

  - Level up as you gain XP
  - Unlock achievements like "Si Tukang Mikir", "Mind Architect", and "Link Legend"
  - Visual XP bar and notifications when you gain XP

- **✍️ Free Drawing Mode**: Draw directly on the canvas with custom colors and line widths
  - Perfect for adding highlights, annotations, or free-form brainstorming
  - Switch between node editing and drawing mode with a single click
  - Choose custom colors and line thickness

## 🚀 Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📋 Usage

- Click "Add Node" to create new nodes
- Click "Add Checklist" to create a checklist item
- Use the colored buttons to create colored nodes
- **🔗 Connect Nodes**:
  1. Click the circular "•" button on any node to start a connection
  2. The button will turn blue and pulse to indicate connection mode
  3. Move to another node and click its connection button (now showing "+")
  4. A line will appear connecting the two nodes
- Click the "✏️" button to edit a node's title, content, color, and checklist status
- Drag nodes to position them
- Use the zoom controls to zoom in/out
- Click "Export as Image" to download your mind map

### 🌟 Using the New Features

- **🎮 Gamification**:

  - Watch your XP grow as you interact with the mind map
  - Check the XP bar in the status bar to see your progress
  - Complete certain actions to unlock achievements
  - ⬆Level up by gaining 100 XP points

- **✍️ Drawing Mode**:
  - Click "Free Drawing" to enter drawing mode
  - Use the color picker to choose a drawing color
  - Select line thickness from the dropdown
  - Draw directly on the canvas
  - Click "Clear Drawings" to remove all drawings
  - Click "Exit Drawing" to return to normal mode

## 💻 Technologies Used

- ⚛️React (Hooks)
- 🌐 HTML5 & CSS3
- 📊 SVG for connections and drawings
- 📷 HTML2Canvas for image export

## 📄 License

MIT
