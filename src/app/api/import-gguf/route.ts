import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { getSettings } from '@/lib/settings';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const modelName = formData.get('modelName') as string;
    const modelfile = formData.get('modelfile') as string;
    const deleteOriginal = formData.get('deleteOriginal') === 'true';

    if (!file || !modelName) {
      return NextResponse.json({ error: 'Missing file or model name' }, { status: 400 });
    }

    const safeName = modelName.trim().toLowerCase().replace(/\s+/g, '-');
    const tempFileName = `temp-import-${Date.now()}.gguf`;
    const tempFilePath = path.join(process.cwd(), tempFileName);
    const tempModelfileName = `temp-modelfile-${Date.now()}.txt`;
    const tempModelfilePath = path.join(process.cwd(), tempModelfileName);

    // 1. Save the uploaded GGUF file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);

       // 2. Create the Modelfile
    // Always use the correct temp file path, even if frontend sent a different FROM
    const ggufPath = tempFilePath.replace(/\\/g, '/');
    
    let finalModelfile = modelfile.trim();
    
    // If modelfile is empty or doesn't have a FROM line, add it
    if (!finalModelfile) {
      finalModelfile = `FROM ${ggufPath}\n`;
    } else if (!finalModelfile.includes('FROM')) {
      finalModelfile = `FROM ${ggufPath}\n\n${finalModelfile}`;
    } else {
      // Replace any existing FROM line with the correct path
      finalModelfile = finalModelfile.replace(/^FROM.*$/m, `FROM ${ggufPath}`);
    }
    
    console.log(`📝 [SERVER] Writing Modelfile content:\n${finalModelfile}`);
    await writeFile(tempModelfilePath, finalModelfile, 'utf-8');

    // 3. Run Ollama create
    const command = `ollama create ${safeName} -f "${tempModelfilePath}"`;
    console.log(`🚀 [SERVER] Importing GGUF: ${command}`);

        try {
      await new Promise<void>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ [SERVER] Ollama Import Error:`, stderr || error.message);
            reject(new Error(stderr || error.message));
          } else {
            console.log(`✅ [SERVER] Ollama Import Success:\n`, stdout);
            resolve();
          }
        });
      });

      return NextResponse.json({ 
        success: true, 
        message: `Model "${safeName}" imported successfully!` 
      });

    } finally {
      // 4. ALWAYS cleanup temporary files (runs whether success or failure)
      try {
        await unlink(tempModelfilePath);
        await unlink(tempFilePath);
        console.log(`🧹 [SERVER] Cleaned up temporary files.`);
      } catch (cleanupError) {
        console.warn(`⚠️ [SERVER] Cleanup warning:`, cleanupError);
      }
    }

  } catch (error: any) {
    console.error('❌ [SERVER] Critical Import Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}