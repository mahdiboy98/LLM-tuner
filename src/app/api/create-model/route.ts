import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, modelfile } = body;

    if (!name || !modelfile) {
      return NextResponse.json({ error: "Missing name or modelfile" }, { status: 400 });
    }

    // 1. Sanitize the model name (Ollama requires lowercase, no spaces)
    const safeName = name.trim().toLowerCase().replace(/\s+/g, '-');
    
    // 2. Create a temporary file path in the project directory
    const tempFileName = `temp-modelfile-${Date.now()}.txt`;
    const tempFilePath = path.join(process.cwd(), tempFileName);

    console.log(`📝 [SERVER] Writing Modelfile to: ${tempFilePath}`);
    
    // 3. Write the modelfile string to the temporary file
    await writeFile(tempFilePath, modelfile.trim(), 'utf-8');

    // 4. Execute the EXACT command that works in CMD
    const command = `ollama create ${safeName} -f "${tempFilePath}"`;
    console.log(`🚀 [SERVER] Executing CLI: ${command}`);

    // 5. Run the command and wait for it to finish
    await new Promise<void>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ [SERVER] Ollama CLI Error:`, stderr || error.message);
          reject(new Error(stderr || error.message));
        } else {
          console.log(`✅ [SERVER] Ollama CLI Success:\n`, stdout);
          resolve();
        }
      });
    });

    // 6. Clean up the temporary file
    await unlink(tempFilePath);
    console.log(`🧹 [SERVER] Cleaned up temporary file.`);

    return NextResponse.json({ 
      success: true, 
      message: `Model "${safeName}" created successfully!` 
    });

  } catch (error: any) {
    console.error('❌ [SERVER] Critical Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}