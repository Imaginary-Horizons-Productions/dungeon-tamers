const Artifact = require("../../Classes/Artifact.js");

module.exports = new Artifact("Oil Painting", "Gain 500 gold when obtaining this artifact.")
	.setElement("Untyped")
	.setFlavorText({ name: "Additional Notes", value: "This will likely end up in the museum of a powerful nation." });
