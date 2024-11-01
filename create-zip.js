import { createWriteStream } from 'fs';
import { join, dirname } from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function createZip() {
  try {
    const output = createWriteStream(join(__dirname, 'project.zip'));
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log('\nProject ZIP created successfully!');
      console.log(`Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      console.log('\nTo download your project:');
      console.log('1. Click "Files" in the left sidebar');
      console.log('2. Find "project.zip" in the root');
      console.log('3. Right-click and select "Download"');
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
      } else {
        throw err;
      }
    });

    archive.pipe(output);

    // Add all files except those we want to ignore
    archive.glob('**/*', {
      ignore: [
        'node_modules/**',
        'dist/**',
        '.bolt/**',
        'create-zip.js',
        'project.zip'
      ],
      dot: true // Include dotfiles
    });

    await archive.finalize();
  } catch (error) {
    console.error('Error creating ZIP:', error);
    process.exit(1);
  }
}

createZip();