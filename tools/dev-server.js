import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors()); // Dev only

const PROJECT_ROOT = path.resolve(process.env.PROJECT_ROOT || path.join(__dirname, '..'));

function safePath(filePath) {
  const resolved = path.resolve(path.join(PROJECT_ROOT, filePath));
  if (!resolved.startsWith(PROJECT_ROOT + path.sep)) return null;
  return resolved;
}

app.post('/write-file', (req, res) => {
  const { filePath, content } = req.body;
  if (!filePath || content === undefined) {
    return res.status(400).json({ error: 'filePath and content are required' });
  }
  const fullPath = safePath(filePath);
  if (!fullPath) return res.status(403).json({ error: 'Path traversal not allowed' });
  try {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Written: ${filePath}`);
    res.json({ success: true, path: fullPath });
  } catch (err) {
    res.status(500).json({ error: 'Write failed', details: err.message });
  }
});

app.get('/read-file', (req, res) => {
  const { path: filePath } = req.query;
  if (!filePath) return res.status(400).json({ error: 'path query param is required' });
  const fullPath = safePath(filePath);
  if (!fullPath) return res.status(403).json({ error: 'Path traversal not allowed' });
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    res.json({ content });
  } catch (err) {
    res.status(404).json({ error: 'File not found', details: err.message });
  }
});

app.listen(3001, () => {
  console.log('✅ Kimi file server running on http://localhost:3001');
  console.log(`📁 Project root: ${PROJECT_ROOT}`);
});