import * as vscode from 'vscode';
const axios = require('axios');
require('dotenv').config();

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "auditz" is now active!');

    let disposable = vscode.commands.registerCommand('ethAnalyzer.analyzeContract', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Please open a file first to analyze contract code.');
            return;
        }

        const text = editor.document.getText(editor.selection);
        if (!text) {
            vscode.window.showInformationMessage('Please select some text first to analyze contract code.');
            return;
        }

        const prompt = `You are a blockchain expert who specializes in smart contract auditing. You will assist me in auditing smart contracts. Please analyze the following smart contract:
					
		Code: ${text}
		
		Please analyze the given smart contract and provide an insightful report with the following information:

		1. Description: Provide a plain-English summary of the smart contract's functionality, purpose, and execution.
		2. Functions: Describe in detail each function and storage value in the contract, its purpose, how it interacts with other functions, and how users interact with it, mention possible vulnerabilities tight to it. Mention any external standards or libraries used in the contract.
		3. Vulnerabilities: List any potential vulnerabilities and their severity. Include the code that's being referenced, if applicable, and mention the line number as a reference.
		4. Compliance: Evaluate the smart contract's compliance with relevant regulatory and legal requirements and mention any deviations.
		5. Security recommendations: Offer suggestions for improving the smart contract's security, efficiency, and overall performance. Include code example on how to fix the issue, if applicable. Give just the code they need to add or subtract, and mention the line number as a reference.
		6. Gas Optimization: Provide recommendations to optimize gas usage in the smart contract. Include specific examples and the potential gas savings.
	
		Please analyze the given smart contract and provide an insightful report in JSON format with the following information:
	
		[
			{ 
			"title": "Description", 
			"answers": ["This smart contract is designed for ..."]
			},
			{
			"title": "Functions",
			"answers": [
				"- Describe the purpose of the function, its interactions, and how users can interact with it.",
				"- Standards and Libraries: List the external standards or libraries used in the contract."
			]
			},
			{ 
			"title": "Vulnerabilities",
			"answers": [
				"- (High Severity): Description of the vulnerability and its impact.",
				"- (Medium Severity): Description of the vulnerability and its impact."
			]
			},
			{ 
			"title": "Compliance", 
			"answers": ["The smart contract complies with the following regulations: ... However, it deviates from ..."]
			},
			{ 
			"title": "Security Recommendations", 
			"answers": [
				"- Description of the suggested improvement and its benefits.",
				"- Description of the suggested improvement and its benefits."
			]
			},
			{
			"title": "Gas Optimization",
			"answers": [
				"- Description of the suggested gas optimization and the potential gas savings."
			]
			}
		]`;
        const data = {
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: prompt,
                },
            ],
        };

        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        };

        try {
			console.log("Preparing to make request to API...");

            // Log the request details (be sure to omit sensitive info)
            console.log(`URL: https://api.openai.com/v1/chat/completions`);
            console.log(`Headers: ${JSON.stringify(headers, null, 2)}`);
            console.log(`Data: ${JSON.stringify(data, null, 2)}`);

            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                data,
                { headers: headers }
            );

			// Log the response (if possible)
            console.log("Response received from API:");
            console.log(response.data);

            // Create a new webview panel and set its content to the results of the analysis
            const panel = vscode.window.createWebviewPanel(
                'auditzResults', // Identifies the type of the webview. Used internally
                'AuditZ Results', // Title of the panel displayed to the user
                vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
                {} // Webview options. More on these later.
            );

            panel.webview.html = `<html><body>${response.data.choices[0].message.content}</body></html>`;
        } catch (error:any) {
            console.error("Error response:", error.response && error.response.data);
            console.error("Error in analyzeSmartContract:", error);
            throw error;
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}