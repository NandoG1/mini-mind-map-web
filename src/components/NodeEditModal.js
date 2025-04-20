import React, { useState, useEffect } from "react";
import "../styles/NodeEditModal.css";

const colorOptions = [
	{ id: "white", value: "white", label: "White" },
	{ id: "blue", value: "#4263eb", label: "Blue" },
	{ id: "green", value: "#12b886", label: "Green" },
	{ id: "yellow", value: "#fab005", label: "Yellow" },
	{ id: "red", value: "#fa5252", label: "Red" },
	{ id: "purple", value: "#7950f2", label: "Purple" },
	{ id: "teal", value: "#1098ad", label: "Teal" },
	{ id: "orange", value: "#fd7e14", label: "Orange" },
	{ id: "pink", value: "#e64980", label: "Pink" },
	{ id: "grey", value: "#495057", label: "Grey" },
];

const NodeEditModal = ({ node, onSave, onDelete, onClose, showConfirm }) => {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [color, setColor] = useState("white");
	const [isChecklistItem, setIsChecklistItem] = useState(false);
	const [checked, setChecked] = useState(false);
	const [customColor, setCustomColor] = useState("");

	useEffect(() => {
		if (node) {
			setTitle(node.title || "");
			setContent(node.content || "");
			setColor(node.color || "white");
			setCustomColor(node.color || "");
			setIsChecklistItem(node.checked !== undefined);
			setChecked(!!node.checked);
		}
	}, [node]);

	const handleSubmit = (e) => {
		e.preventDefault();
		const finalColor = customColor || color;

		onSave({
			...node,
			title,
			content,
			color: finalColor !== "white" ? finalColor : null,
			...(isChecklistItem ? { checked } : {}),
		});
	};

	const handleDelete = () => {
		showConfirm("Are you sure you want to delete this node?", () => {
			onDelete(node.id);
		});
	};

	const handleColorChange = (newColor) => {
		setColor(newColor);
		setCustomColor("");
	};

	const handleCustomColorChange = (e) => {
		setCustomColor(e.target.value);
		setColor("custom");
	};

	const handleChecklistToggle = (e) => {
		setIsChecklistItem(e.target.checked);
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<h2>Edit Node</h2>
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="title">Title</label>
						<input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
					</div>

					<div className="form-group">
						<label htmlFor="content">Content</label>
						<textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
					</div>

					<div className="form-group">
						<label>Color</label>
						<div className="color-picker">
							{colorOptions.map((option) => (
								<div key={option.id} className={`color-option ${color === option.value ? "selected" : ""}`} style={{ backgroundColor: option.value }} onClick={() => handleColorChange(option.value)} title={option.label} />
							))}
							<div className="custom-color-input">
								<input type="color" value={customColor} onChange={handleCustomColorChange} title="Custom color" />
							</div>
						</div>
					</div>

					<div className="form-group checkbox-group">
						<div className="checkbox-container">
							<input type="checkbox" id="isChecklistItem" checked={isChecklistItem} onChange={handleChecklistToggle} />
							<label htmlFor="isChecklistItem">Make this a checklist item</label>
						</div>

						{isChecklistItem && (
							<div className="status-container">
								<input type="checkbox" id="checked" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
								<label htmlFor="checked">Mark as completed</label>
							</div>
						)}
					</div>

					<div className="modal-actions">
						<button type="button" className="delete-btn" onClick={handleDelete}>
							Delete
						</button>
						<div>
							<button type="button" className="cancel-btn" onClick={onClose}>
								Cancel
							</button>
							<button type="submit" className="save-btn">
								Save
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default NodeEditModal;
