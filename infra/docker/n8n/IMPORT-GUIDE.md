# How to Import Workflows into n8n

## ✅ Recommended: UI Import (Most Reliable)

The n8n UI import handles workflow format automatically and is the recommended method.

### Steps:

1. **Open n8n**: Go to http://localhost:5678
2. **Navigate to Workflows**: Click "Workflows" in the left sidebar
3. **Import**:
   - Click the **"+"** button (top right) or
   - Click **"Import from File"** from the menu
4. **Select files**:
   - `workflows/task-enrichment.json`
   - `workflows/task-enrichment-cron.json`
5. **Done!** The workflows will appear in your workflow list

### Alternative: Copy-Paste Method

1. Open the workflow JSON file in a text editor
2. Copy all the JSON content
3. In n8n UI, go to Workflows → Click "+" → Press `Cmd+V` (Mac) or `Ctrl+V` (Windows)
4. The workflow will be imported automatically

---

## ⚠️ API Import (Has Issues)

The API import script (`import-workflows.sh`) currently fails due to n8n's strict API validation. The API endpoint expects a different schema than exported workflows.

**Workaround**: Use UI import instead (see above).

**If you need API import**, you would need to:
1. Export a workflow from n8n UI first
2. Compare the exported format with our workflow files
3. Remove/adjust fields that cause validation errors

But UI import is simpler and recommended by n8n docs.

---

## After Import

1. **Configure credentials**: 
   - Go to Settings → Credentials
   - Add your OpenAI API key
   - The workflows will reference this

2. **Set environment variables**:
   - In n8n Settings → Environment Variables
   - Add: `NEXT_API_BASE_URL=http://localhost:3000`

3. **Activate workflows**:
   - Toggle the workflows ON in the workflow list
   - The Cron workflow will start running every 2 minutes

