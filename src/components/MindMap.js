import React, { useState, useEffect, useRef } from "react";
import Node from "./Node";
import Connection from "./Connection";
import NodeEditModal from "./NodeEditModal";
import html2canvas from "html2canvas";
import "../styles/MindMap.css";

const MindMap = () => {
	const [nodes, setNodes] = useState([]);
	const [connections, setConnections] = useState([]);
	const [selectedNode, setSelectedNode] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isCreatingConnection, setIsCreatingConnection] = useState(false);
	const [connectionStart, setConnectionStart] = useState(null);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [editingNode, setEditingNode] = useState(null);
	const [activeConnection, setActiveConnection] = useState(null);
	const [userXP, setUserXP] = useState(0);
	const [userLevel, setUserLevel] = useState(1);
	const [achievements, setAchievements] = useState([]);
	const [showXPGain, setShowXPGain] = useState(false);
	const [latestXP, setLatestXP] = useState(0);
	const [isDrawingMode, setIsDrawingMode] = useState(false);
	const [currentPath, setCurrentPath] = useState(null);
	const [drawings, setDrawings] = useState([]);
	const [drawingColor, setDrawingColor] = useState("#000000");
	const [drawingWidth, setDrawingWidth] = useState(2);
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	const [isPanning, setIsPanning] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [confirmDialogData, setConfirmDialogData] = useState({
		message: "",
		onConfirm: () => {},
		onCancel: () => {},
	});

	const canvasRef = useRef(null);
	const canvasContainerRef = useRef(null);
	const drawingCanvasRef = useRef(null);
	const lastMousePosition = useRef({ x: 0, y: 0 });
	const dragOffset = useRef({ x: 0, y: 0 });

	useEffect(() => {
		const savedNodes = localStorage.getItem("mindmap-nodes");
		const savedConnections = localStorage.getItem("mindmap-connections");
		const savedXP = localStorage.getItem("mindmap-xp");
		const savedLevel = localStorage.getItem("mindmap-level");
		const savedAchievements = localStorage.getItem("mindmap-achievements");
		const savedDrawings = localStorage.getItem("mindmap-drawings");

		if (savedNodes) {
			setNodes(JSON.parse(savedNodes));
		}

		if (savedConnections) {
			setConnections(JSON.parse(savedConnections));
		}

		if (savedXP) {
			setUserXP(parseInt(savedXP, 10));
		}

		if (savedLevel) {
			setUserLevel(parseInt(savedLevel, 10));
		}

		if (savedAchievements) {
			setAchievements(JSON.parse(savedAchievements));
		}

		if (savedDrawings) {
			setDrawings(JSON.parse(savedDrawings));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("mindmap-nodes", JSON.stringify(nodes));
		localStorage.setItem("mindmap-connections", JSON.stringify(connections));
		localStorage.setItem("mindmap-xp", userXP.toString());
		localStorage.setItem("mindmap-level", userLevel.toString());
		localStorage.setItem("mindmap-achievements", JSON.stringify(achievements));
		localStorage.setItem("mindmap-drawings", JSON.stringify(drawings));
	}, [nodes, connections, userXP, userLevel, achievements, drawings]);

	const addNotification = (message, type = "info", duration = 3000) => {
		const id = Date.now();
		const newNotification = { id, message, type };
		setNotifications((prev) => [...prev, newNotification]);

		setTimeout(() => {
			setNotifications((prev) => prev.filter((notification) => notification.id !== id));
		}, duration);
	};

	const showConfirm = (message, onConfirm, onCancel = () => {}) => {
		setConfirmDialogData({ message, onConfirm, onCancel });
		setShowConfirmDialog(true);
	};

	const addXP = (amount, reason) => {
		const newXP = userXP + amount;
		setUserXP(newXP);
		setLatestXP(amount);
		setShowXPGain(true);

		setTimeout(() => {
			setShowXPGain(false);
		}, 2000);

		const newLevel = Math.floor(newXP / 100) + 1;
		if (newLevel > userLevel) {
			setUserLevel(newLevel);

			addNotification(`🎉 Level Up! You are now Level ${newLevel}!`, "success", 5000);
		}

		checkAchievements(newXP, nodes.length, connections.length);
	};

	const checkAchievements = (xp, nodeCount, connectionCount) => {
		const newAchievements = [...achievements];

		if (xp >= 100 && !achievements.includes("Mind Architect")) {
			newAchievements.push("Mind Architect");
			addNotification("🏆 Achievement Unlocked: Mind Architect!", "achievement", 5000);
		}

		if (nodeCount >= 5 && !achievements.includes("Si Tukang Mikir")) {
			newAchievements.push("Si Tukang Mikir");
			addNotification("🏆 Achievement Unlocked: Si Tukang Mikir!", "achievement", 5000);
		}

		if (connectionCount >= 5 && !achievements.includes("Link Legend")) {
			newAchievements.push("Link Legend");
			addNotification("🏆 Achievement Unlocked: Link Legend!", "achievement", 5000);
		}

		if (newAchievements.length > achievements.length) {
			setAchievements(newAchievements);
		}
	};

	const addNode = () => {
		const rect = canvasRef.current?.getBoundingClientRect();
		const canvasWidth = rect?.width || 800;
		const canvasHeight = rect?.height || 600;

		const centerX = canvasWidth / 2 / zoom - pan.x;
		const centerY = canvasHeight / 2 / zoom - pan.y;

		const randomOffset = 50;
		const randomX = centerX + (Math.random() * randomOffset * 2 - randomOffset);
		const randomY = centerY + (Math.random() * randomOffset * 2 - randomOffset);

		const newNode = {
			id: `node-${Date.now()}`,
			title: "New Node",
			content: "",
			x: randomX,
			y: randomY,
			draggable: true,
		};

		console.log("Adding new node at position:", randomX, randomY);

		const updatedNodes = [newNode, ...nodes];
		setNodes(updatedNodes);
		addXP(10, "Created a new node");
	};

	const startDrag = (nodeId, e) => {
		e.stopPropagation();

		if (isDrawingMode || isCreatingConnection) {
			return;
		}

		const nodeIndex = nodes.findIndex((node) => node.id === nodeId);
		if (nodeIndex === -1) {
			console.warn(`Node with id ${nodeId} not found for dragging`);
			return;
		}

		setSelectedNode(nodeId);
		setIsDragging(true);

		const node = nodes[nodeIndex];
		const rect = canvasRef.current.getBoundingClientRect();

		const nodeScreenX = node.x * zoom + pan.x;
		const nodeScreenY = node.y * zoom + pan.y;

		dragOffset.current = {
			x: e.clientX - rect.left - nodeScreenX,
			y: e.clientY - rect.top - nodeScreenY,
		};
	};

	const handleDrag = (e) => {
		if (!isDragging || !selectedNode) {
			return;
		}

		e.stopPropagation();
		e.preventDefault();

		const rect = canvasRef.current.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const nodeIndex = nodes.findIndex((node) => node.id === selectedNode);
		if (nodeIndex === -1) return;

		const offset = dragOffset.current;
		const newX = (mouseX - offset.x - pan.x) / zoom;
		const newY = (mouseY - offset.y - pan.y) / zoom;

		const updatedNodes = [...nodes];
		updatedNodes[nodeIndex] = {
			...updatedNodes[nodeIndex],
			x: newX,
			y: newY,
		};

		setNodes(updatedNodes);
	};

	const stopDrag = () => {
		if (isDragging) {
			console.log("Stopping drag for node:", selectedNode);
			setIsDragging(false);
			setSelectedNode(null);
		}
	};

	const startConnection = (nodeId) => {
		if (isDrawingMode) return;

		console.log("Starting connection from node:", nodeId);
		setIsCreatingConnection(true);
		setConnectionStart(nodeId);
	};

	const completeConnection = (nodeId) => {
		console.log("Completing connection to node:", nodeId, "from:", connectionStart);

		if (isCreatingConnection && connectionStart && connectionStart !== nodeId) {
			const existingConnection = connections.find((conn) => (conn.from === connectionStart && conn.to === nodeId) || (conn.from === nodeId && conn.to === connectionStart));

			if (!existingConnection) {
				const newConnection = {
					id: `connection-${Date.now()}`,
					from: connectionStart,
					to: nodeId,
				};

				console.log("Creating new connection:", newConnection);
				setConnections([...connections, newConnection]);
				addXP(15, "Connected two nodes");
			} else {
				console.log("Connection already exists");
			}
		} else {
			console.log("Invalid connection attempt");
		}

		setIsCreatingConnection(false);
		setConnectionStart(null);
	};

	const cancelConnection = () => {
		console.log("Canceling connection");
		setIsCreatingConnection(false);
		setConnectionStart(null);
	};

	const handleMouseMove = (e) => {
		if (isDrawingMode && currentPath) {
			e.preventDefault();

			const rect = canvasRef.current.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			const updatedPoints = [...currentPath.points];
			updatedPoints.push({
				x: (mouseX - pan.x) / zoom,
				y: (mouseY - pan.y) / zoom,
			});

			setCurrentPath({
				...currentPath,
				points: updatedPoints,
			});
		}

		if (isDragging && selectedNode) {
			handleDrag(e);
		}

		if (isCreatingConnection) {
			const rect = canvasRef.current.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			const newPos = {
				x: (mouseX - pan.x) / zoom,
				y: (mouseY - pan.y) / zoom,
			};

			console.log("Mouse move during connection:", newPos);
			setMousePosition(newPos);
		}

		if (isPanning && !isDrawingMode && !isDragging && !isCreatingConnection) {
			const movementX = e.movementX || 0;
			const movementY = e.movementY || 0;

			setPan((prevPan) => ({
				x: prevPan.x + movementX,
				y: prevPan.y + movementY,
			}));
		}
	};

	const handleCanvasMouseDown = (e) => {
		if (e.target.closest(".node")) {
			return;
		}

		if (isCreatingConnection) {
			return;
		}

		if (isDrawingMode) {
			const rect = canvasRef.current.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			const x = (mouseX - pan.x) / zoom;
			const y = (mouseY - pan.y) / zoom;

			setCurrentPath({
				id: `drawing-${Date.now()}`,
				points: [{ x, y }],
				color: drawingColor,
				width: drawingWidth,
			});
			return;
		}

		if (e.button === 0) {
			setIsPanning(true);
		}
	};

	const handleCanvasMouseUp = (e) => {
		if (isDrawingMode && currentPath) {
			if (currentPath.points.length > 1) {
				setDrawings([...drawings, currentPath]);
				addXP(5, "Created a drawing");
			}
			setCurrentPath(null);
		}

		if (isDragging) {
			stopDrag();
		}

		if (isCreatingConnection) {
			if (e.target === canvasRef.current || e.target.classList.contains("connections-layer")) {
				cancelConnection();
			}
		}

		setIsPanning(false);
	};

	const handleCanvasMouseLeave = () => {
		if (isDrawingMode && currentPath) {
			if (currentPath.points.length > 1) {
				setDrawings([...drawings, currentPath]);
			}
			setCurrentPath(null);
		}

		setIsPanning(false);
	};

	const handleNodeEdit = (nodeId) => {
		const node = nodes.find((n) => n.id === nodeId);
		if (node) {
			setEditingNode(node);
		}
	};

	const saveNodeEdit = (updatedNode) => {
		setNodes(nodes.map((node) => (node.id === updatedNode.id ? updatedNode : node)));
		setEditingNode(null);
		addXP(5, "Edited a node");
	};

	const deleteNode = (nodeId) => {
		setNodes(nodes.filter((node) => node.id !== nodeId));
		setConnections(connections.filter((conn) => conn.from !== nodeId && conn.to !== nodeId));
		setEditingNode(null);
	};

	const toggleNodeChecked = (nodeId) => {
		const node = nodes.find((n) => n.id === nodeId);

		if (node && node.checked !== undefined) {
			const newCheckedState = !node.checked;

			setNodes(
				nodes.map((node) => {
					if (node.id === nodeId) {
						return { ...node, checked: newCheckedState };
					}
					return node;
				})
			);

			if (newCheckedState) {
				addXP(20, "Completed a checklist item");
			}
		}
	};

	const handleZoom = (e) => {
		if (isDrawingMode) return;

		e.preventDefault();
		const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
		setZoom((prevZoom) => Math.min(Math.max(prevZoom * zoomFactor, 0.5), 2));
	};

	const handlePan = (e) => {
		//
	};

	const exportToImage = () => {
		html2canvas(canvasRef.current, {
			backgroundColor: null,
			scale: 2,
		}).then((canvas) => {
			const link = document.createElement("a");
			link.download = "mindmap.png";
			link.href = canvas.toDataURL("image/png");
			link.click();
		});
	};

	const addColoredNode = (color) => {
		const rect = canvasRef.current?.getBoundingClientRect();
		const canvasWidth = rect?.width || 800;
		const canvasHeight = rect?.height || 600;

		const centerX = canvasWidth / 2 / zoom - pan.x;
		const centerY = canvasHeight / 2 / zoom - pan.y;

		const randomOffset = 50;
		const randomX = centerX + (Math.random() * randomOffset * 2 - randomOffset);
		const randomY = centerY + (Math.random() * randomOffset * 2 - randomOffset);

		const newNode = {
			id: `node-${Date.now()}`,
			title: "New Node",
			content: "",
			x: randomX,
			y: randomY,
			color,
			draggable: true,
		};

		const updatedNodes = [newNode, ...nodes];
		setNodes(updatedNodes);
		addXP(10, "Created a colored node");
	};

	const addChecklistNode = () => {
		const rect = canvasRef.current?.getBoundingClientRect();
		const canvasWidth = rect?.width || 800;
		const canvasHeight = rect?.height || 600;

		const centerX = canvasWidth / 2 / zoom - pan.x;
		const centerY = canvasHeight / 2 / zoom - pan.y;

		const randomOffset = 50;
		const randomX = centerX + (Math.random() * randomOffset * 2 - randomOffset);
		const randomY = centerY + (Math.random() * randomOffset * 2 - randomOffset);

		const newNode = {
			id: `node-${Date.now()}`,
			title: "Checklist Item",
			content: "",
			x: randomX,
			y: randomY,
			checked: false,
			draggable: true,
		};

		const updatedNodes = [newNode, ...nodes];
		setNodes(updatedNodes);
		addXP(10, "Created a checklist item");
	};

	const toggleDrawingMode = () => {
		setIsDrawingMode(!isDrawingMode);
		setIsDragging(false);
		setIsCreatingConnection(false);
		setConnectionStart(null);
		setSelectedNode(null);
		setCurrentPath(null);
	};

	const clearDrawings = () => {
		showConfirm("Are you sure you want to clear all drawings?", () => {
			setDrawings([]);
			addNotification("All drawings cleared", "info");
		});
	};

	const pathToSvgPath = (path) => {
		if (!path || path.points.length < 2) return "";

		const [first, ...rest] = path.points;
		return `M ${first.x} ${first.y} ` + rest.map((point) => `L ${point.x} ${point.y}`).join(" ");
	};

	const renderCurrentConnection = () => {
		if (!isCreatingConnection || !connectionStart) {
			console.log("Not creating connection or no connectionStart");
			return null;
		}

		console.log("Creating connection from node:", connectionStart);

		const startNode = nodes.find((node) => node.id === connectionStart);
		if (!startNode) {
			console.log("Start node not found");
			return null;
		}

		const startX = startNode.x + 75;
		const startY = startNode.y + 50;

		const endX = mousePosition.x;
		const endY = mousePosition.y;

		console.log("Drawing connection line from:", startX, startY, "to:", endX, endY);
		console.log("Current mouse position:", mousePosition);

		return (
			<>
				<line className="connection-line-temp" x1={startX} y1={startY} x2={endX} y2={endY} stroke="#4263eb" strokeDasharray="5,5" strokeWidth="2" />
				<circle cx={endX} cy={endY} r={5} fill="#4263eb" />
			</>
		);
	};

	return (
		<div className="mind-map-container">
			<div className="toolbar">
				<button className="add-node-btn" onClick={addNode}>
					Add Node
				</button>
				<button className="add-task-btn" onClick={addChecklistNode}>
					Add Checklist
				</button>
				<div className="node-color-options">
					<button className="color-node-btn green" onClick={() => addColoredNode("#12b886")} title="Add Green Node" />
					<button className="color-node-btn blue" onClick={() => addColoredNode("#4263eb")} title="Add Blue Node" />
					<button className="color-node-btn yellow" onClick={() => addColoredNode("#fab005")} title="Add Yellow Node" />
				</div>

				<div className="drawing-tools">
					<button className={`drawing-mode-btn ${isDrawingMode ? "active" : ""}`} onClick={toggleDrawingMode} title={isDrawingMode ? "Exit Drawing Mode" : "Enter Drawing Mode"}>
						{isDrawingMode ? "Exit Drawing" : "Free Drawing"}
					</button>

					{isDrawingMode && (
						<>
							<input type="color" value={drawingColor} onChange={(e) => setDrawingColor(e.target.value)} className="drawing-color-picker" title="Drawing Color" />
							<select value={drawingWidth} onChange={(e) => setDrawingWidth(Number(e.target.value))} className="drawing-width-selector" title="Drawing Width">
								<option value="1">Thin</option>
								<option value="2">Medium</option>
								<option value="4">Thick</option>
							</select>
							<button className="clear-drawings-btn" onClick={clearDrawings} title="Clear All Drawings">
								Clear Drawings
							</button>
						</>
					)}
				</div>

				<button className="export-btn" onClick={exportToImage}>
					Export as Image
				</button>
				<div className="zoom-controls">
					<button onClick={() => setZoom((prev) => Math.min(prev + 0.1, 2))}>+</button>
					<span>{Math.round(zoom * 100)}%</span>
					<button onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.5))}>-</button>
				</div>
			</div>

			<div className="status-bar">
				<div className="xp-container">
					<span className="level-badge">Level {userLevel}</span>
					<div className="xp-bar">
						<div className="xp-progress" style={{ width: `${userXP % 100}%` }}></div>
					</div>
					<span className="xp-text">{userXP} XP</span>
				</div>

				{achievements.length > 0 && (
					<div className="achievements-container">
						{achievements.map((achievement) => (
							<span key={achievement} className="achievement-badge" title={achievement}>
								{achievement === "Si Tukang Mikir" ? "🎖️" : achievement === "Mind Architect" ? "🧠" : achievement === "Link Legend" ? "🔗" : "🏆"}
							</span>
						))}
					</div>
				)}
			</div>

			{showXPGain && <div className="xp-notification">+{latestXP} XP</div>}

			<div className="canvas-wrapper" ref={canvasContainerRef} onWheel={handleZoom} onContextMenu={(e) => e.preventDefault()}>
				<div
					ref={canvasRef}
					className={`canvas ${isDrawingMode ? "drawing-mode" : ""}`}
					style={{
						transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
					}}
					onMouseMove={handleMouseMove}
					onMouseDown={handleCanvasMouseDown}
					onMouseUp={handleCanvasMouseUp}
					onMouseLeave={handleCanvasMouseLeave}
				>
					<svg className="connections-layer">
						<defs>
							<marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
								<polygon points="0 0, 10 3.5, 0 7" fill="#555" />
							</marker>
						</defs>

						{connections.map((connection) => (
							<Connection key={connection.id} connection={connection} nodes={nodes} isActive={activeConnection === connection.id} />
						))}

						{isCreatingConnection && renderCurrentConnection()}

						{drawings.map((drawing) => (
							<path key={drawing.id} className="drawing-path" d={pathToSvgPath(drawing)} stroke={drawing.color} strokeWidth={drawing.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						))}

						{currentPath && <path className="drawing-path current" d={pathToSvgPath(currentPath)} stroke={currentPath.color} strokeWidth={currentPath.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
					</svg>

					{nodes.map((node) => (
						<Node key={node.id} node={node} onDragStart={(e) => startDrag(node.id, e)} onEdit={() => handleNodeEdit(node.id)} onStartConnection={() => startConnection(node.id)} onCompleteConnection={() => completeConnection(node.id)} isConnecting={isCreatingConnection} isConnectionStart={connectionStart === node.id} onToggleChecked={toggleNodeChecked} />
					))}
				</div>
			</div>

			<div className="notification-container">
				{notifications.map((notification) => (
					<div key={notification.id} className={`notification ${notification.type}`}>
						{notification.message}
					</div>
				))}
			</div>

			{showConfirmDialog && (
				<div className="confirm-dialog-overlay">
					<div className="confirm-dialog">
						<p>{confirmDialogData.message}</p>
						<div className="confirm-dialog-buttons">
							<button
								onClick={() => {
									confirmDialogData.onConfirm();
									setShowConfirmDialog(false);
								}}
								className="confirm-yes"
							>
								Yes
							</button>
							<button
								onClick={() => {
									confirmDialogData.onCancel();
									setShowConfirmDialog(false);
								}}
								className="confirm-no"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{editingNode && <NodeEditModal node={editingNode} onSave={saveNodeEdit} onDelete={deleteNode} onClose={() => setEditingNode(null)} showConfirm={showConfirm} />}
		</div>
	);
};

export default MindMap;
