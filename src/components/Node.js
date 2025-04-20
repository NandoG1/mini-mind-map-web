import React, { useState, useRef, useEffect } from "react";
import "../styles/Node.css";

const Node = ({ node, onDragStart, onEdit, onStartConnection, onCompleteConnection, isConnecting, isConnectionStart, onToggleChecked }) => {
	const [isHovered, setIsHovered] = useState(false);
	const [dimensions, setDimensions] = useState({ width: node.width, height: node.height });
	const titleRef = useRef(null);
	const contentRef = useRef(null);

	useEffect(() => {
		const MIN_WIDTH = 150;
		const MIN_HEIGHT = 100;

		const titleWidth = titleRef.current ? titleRef.current.scrollWidth + 60 : 0;
		const contentWidth = contentRef.current ? contentRef.current.scrollWidth + 20 : 0;
		const contentHeight = contentRef.current ? contentRef.current.scrollHeight + 60 : 0;

		const optimalWidth = Math.max(MIN_WIDTH, titleWidth, contentWidth);
		const optimalHeight = Math.max(MIN_HEIGHT, contentHeight);

		if (optimalWidth !== dimensions.width || optimalHeight !== dimensions.height) {
			setDimensions({ width: optimalWidth, height: optimalHeight });
		}
	}, [node.title, node.content]);

	const handleNodeMouseDown = (e) => {
		if (e.button === 0 && !isConnecting) {
			console.log("Node mousedown:", node.id);
			onDragStart(e, node.id);
		}
	};

	const handleConnectionPoint = (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (isConnecting && !isConnectionStart) {
			onCompleteConnection();
		} else {
			onStartConnection();
		}
	};

	const handleEdit = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onEdit();
	};

	const handleCheckToggle = (e) => {
		e.preventDefault();
		e.stopPropagation();
		onToggleChecked(node.id);
	};

	const handleContentMouseDown = (e) => {
		if (e.target.closest(".node-actions")) {
			return;
		}

		e.preventDefault();
	};

	const nodeStyle = {
		left: node.x,
		top: node.y,
		width: dimensions.width,
		height: dimensions.height,
		backgroundColor: node.color || "white",
		borderColor: node.checked ? "#12b886" : node.color ? adjustBorderColor(node.color) : "#dee2e6",
		opacity: node.checked ? 0.8 : 1,
	};

	function adjustBorderColor(color) {
		return color === "white" ? "#dee2e6" : color;
	}

	return (
		<div id={node.id} className={`node ${isHovered ? "hovered" : ""} ${isConnectionStart ? "connecting" : ""} ${node.checked ? "checked" : ""}`} style={nodeStyle} onMouseDown={handleNodeMouseDown} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
			<div className="node-header" style={{ backgroundColor: node.color ? adjustHeaderBgColor(node.color) : "#f8f9fa" }} onMouseDown={handleContentMouseDown}>
				<div className="node-title-container">
					{node.checked !== undefined && (
						<div className="node-checkbox">
							<input type="checkbox" checked={!!node.checked} onChange={handleCheckToggle} onClick={(e) => e.stopPropagation()} />
						</div>
					)}
					<h3
						ref={titleRef}
						className="node-title"
						style={{
							textDecoration: node.checked ? "line-through" : "none",
							color: getTextColor(node.color),
						}}
					>
						{node.title}
					</h3>
				</div>
				<div className="node-actions">
					<button className={`connection-point ${isConnecting ? (isConnectionStart ? "connecting-from" : "connecting-to") : ""}`} title={isConnecting ? (isConnectionStart ? "Connecting..." : "Complete connection") : "Start connection"} onClick={handleConnectionPoint}>
						{isConnecting ? (isConnectionStart ? "•" : "+") : "•"}
					</button>
					<button className="edit-button" onClick={handleEdit} title="Edit node">
						✏️
					</button>
				</div>
			</div>
			<div ref={contentRef} className="node-content" style={{ color: getTextColor(node.color) }} onMouseDown={handleContentMouseDown}>
				{node.content}
			</div>
		</div>
	);
};

function getTextColor(bgColor) {
	if (!bgColor || bgColor === "white") return "#495057";

	const hex = bgColor.replace("#", "");
	const r = parseInt(hex.substr(0, 2), 16) || 0;
	const g = parseInt(hex.substr(2, 2), 16) || 0;
	const b = parseInt(hex.substr(4, 2), 16) || 0;

	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	return luminance > 0.5 ? "#212529" : "#ffffff";
}

function adjustHeaderBgColor(color) {
	if (color === "white") return "#f8f9fa";

	const hex = color.replace("#", "");
	const r = parseInt(hex.substr(0, 2), 16) || 255;
	const g = parseInt(hex.substr(2, 2), 16) || 255;
	const b = parseInt(hex.substr(4, 2), 16) || 255;

	const lightenFactor = 0.8;
	const r2 = Math.round(r + (255 - r) * lightenFactor);
	const g2 = Math.round(g + (255 - g) * lightenFactor);
	const b2 = Math.round(b + (255 - b) * lightenFactor);

	return `rgb(${r2}, ${g2}, ${b2})`;
}

export default Node;
