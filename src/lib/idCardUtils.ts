import html2canvas from 'html2canvas';
import JSZip from 'jszip';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  department: string;
  role?: string;
  photo_url?: string;
  joining_date: string;
}

/**
 * Generate ID card HTML for rendering
 */
export function generateIDCardHTML(employee: Employee, side: 'front' | 'back'): string {
  const qrCodeData = `https://vedtechservices.in/employee/${employee.employee_id}`;
  const validTillDate = new Date(new Date(employee.joining_date).setFullYear(new Date(employee.joining_date).getFullYear() + 3))
    .toISOString().split('T')[0];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  if (side === 'front') {
    return `
      <div style="width: 350px; height: 550px; background: linear-gradient(135deg, #0a1f44 0%, #1e3a8a 50%, #3b82f6 100%); border-radius: 16px; overflow: hidden; position: relative; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="padding: 24px; text-align: center; position: relative;">
          <div style="width: 64px; height: 64px; margin: 0 auto 8px; background-color: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.3);">
            <span style="font-size: 24px; font-weight: bold; color: white;">VS</span>
          </div>
          <h1 style="color: white; font-size: 24px; font-weight: bold; margin: 0 0 4px 0;">VED TECH SERVICES</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 12px; margin: 0;">Digital Solutions | Endless Possibilities</p>
        </div>

        <!-- Employee Photo -->
        <div style="display: flex; justify-content: center; margin-bottom: 16px;">
          <div style="width: 128px; height: 128px; border-radius: 50%; border: 4px solid white; overflow: hidden; background: ${employee.photo_url ? 'white' : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'};">
            ${employee.photo_url ? `<img src="${employee.photo_url}" alt="${employee.name}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #2563eb;">👤</div>`}
          </div>
        </div>

        <!-- Employee Details -->
        <div style="padding: 0 24px;">
          <div style="text-align: center; margin-bottom: 12px;">
            <h2 style="color: white; font-size: 20px; font-weight: bold; margin: 0 0 4px 0;">${employee.name}</h2>
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; margin: 0;">${employee.role || employee.department}</p>
          </div>

          <!-- Info Cards -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 8px; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2);">
              <span style="color: rgba(255,255,255,0.9); font-size: 10px;">DEPARTMENT</span>
              <span style="color: white; font-size: 14px; font-weight: 500; margin-left: auto;">${employee.department}</span>
            </div>

            <div style="background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 8px; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2);">
              <span style="color: rgba(255,255,255,0.9); font-size: 10px;">EMAIL</span>
              <span style="color: white; font-size: 11px; font-weight: 500; margin-left: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${employee.email}</span>
            </div>

            <div style="background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 8px; display: flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.2);">
              <span style="color: rgba(255,255,255,0.9); font-size: 10px;">PHONE</span>
              <span style="color: white; font-size: 14px; font-weight: 500; margin-left: auto;">${employee.phone}</span>
            </div>

            <div style="display: flex; gap: 8px;">
              <div style="flex: 1; background-color: rgba(255,255,255,0.1); border-radius: 8px; padding: 8px; border: 1px solid rgba(255,255,255,0.2);">
                <div style="color: rgba(255,255,255,0.9); font-size: 10px; margin-bottom: 4px;">EMPLOYEE ID</div>
                <div style="color: white; font-size: 14px; font-weight: bold;">${employee.employee_id}</div>
              </div>
              <div style="width: 80px; height: 80px; background: white; border-radius: 8px; padding: 4px; display: flex; align-items: center; justify-content: center;">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(qrCodeData)}" alt="QR Code" style="width: 72px; height: 72px;">
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.3), transparent); padding: 16px; text-align: center;">
          <p style="color: white; font-size: 11px; font-weight: 500; margin: 0;">www.vedtechservices.in</p>
        </div>
      </div>
    `;
  } else {
    return `
      <div style="width: 350px; height: 550px; background: white; border-radius: 16px; overflow: hidden; font-family: Arial, sans-serif;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0a1f44 0%, #1e3a8a 50%, #3b82f6 100%); padding: 24px; text-align: center; position: relative;">
          <div style="width: 48px; height: 48px; margin: 0 auto 8px; background-color: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.3);">
            <span style="font-size: 20px; font-weight: bold; color: white;">VS</span>
          </div>
          <h1 style="color: white; font-size: 20px; font-weight: bold; margin: 0;">VED TECH SERVICES</h1>
        </div>

        <!-- Terms & Conditions -->
        <div style="padding: 24px;">
          <h2 style="font-size: 16px; font-weight: bold; color: #1e3a8a; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <span style="width: 32px; height: 32px; border-radius: 50%; background: #dbeafe; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: bold;">✓</span>
            TERMS & CONDITIONS
          </h2>
          
          <div style="font-size: 11px; color: #374151; line-height: 1.6; margin-bottom: 16px;">
            <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 8px;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #dbeafe; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: bold; font-size: 10px; flex-shrink: 0;">✓</span>
              <p style="margin: 0;">This ID card is the property of Ved Tech Services.</p>
            </div>
            <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 8px;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #dbeafe; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: bold; font-size: 10px; flex-shrink: 0;">✓</span>
              <p style="margin: 0;">This card is non-transferable and must be surrendered upon request.</p>
            </div>
            <div style="display: flex; align-items: start; gap: 8px;">
              <span style="width: 24px; height: 24px; border-radius: 50%; background: #dbeafe; display: flex; align-items: center; justify-content: center; color: #2563eb; font-weight: bold; font-size: 10px; flex-shrink: 0;">✓</span>
              <p style="margin: 0;">If found, please return to the address below.</p>
            </div>
          </div>

          <!-- Validity Dates -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div style="background: #eff6ff; border-radius: 8px; padding: 12px; border: 1px solid #bfdbfe;">
              <div style="font-size: 10px; font-weight: 500; color: #1e3a8a; margin-bottom: 4px;">JOIN DATE</div>
              <div style="font-size: 13px; font-weight: bold; color: #1e3a8a;">${formatDate(employee.joining_date)}</div>
            </div>
            <div style="background: #eff6ff; border-radius: 8px; padding: 12px; border: 1px solid #bfdbfe;">
              <div style="font-size: 10px; font-weight: 500; color: #1e3a8a; margin-bottom: 4px;">VALID TILL</div>
              <div style="font-size: 13px; font-weight: bold; color: #1e3a8a;">${formatDate(validTillDate)}</div>
            </div>
          </div>

          <!-- Signature -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-bottom: 16px;">
            <div style="text-align: center;">
              <div style="height: 48px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 4px;">
                <p style="font-size: 18px; font-style: italic; color: #6b7280; margin: 0;">${employee.name}</p>
              </div>
              <div style="border-top: 1px solid #9ca3af; width: 192px; margin: 0 auto 4px;"></div>
              <p style="font-size: 11px; font-weight: 500; color: #6b7280; margin: 0;">AUTHORIZED SIGNATURE</p>
            </div>
          </div>

          <!-- QR Code -->
          <div style="display: flex; justify-content: center;">
            <div style="background: white; border: 2px solid #bfdbfe; border-radius: 8px; padding: 8px;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrCodeData)}" alt="QR Code" style="width: 80px; height: 80px;">
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to bottom, #1e3a8a, #000); color: white; padding: 16px; text-align: center; font-size: 10px;">
          <div style="margin-bottom: 8px;">
            <strong style="font-size: 11px;">Ved Tech Services</strong><br>
            Samastipur, Bihar, India<br>
            Remote Available
          </div>
          <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 8px;">
            <span style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3);">f</span>
            <span style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3);">in</span>
            <span style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3);">ig</span>
            <span style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.3);">yt</span>
          </div>
          <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 8px;">
            <p style="font-size: 10px; font-weight: 500; color: rgba(255,255,255,0.9); margin: 0;">TECHNOLOGY | TRADITION | TRANSFORMATION</p>
            <p style="font-size: 10px; color: rgba(255,255,255,0.8); margin: 4px 0 0 0;">वसुधैव कुटुम्बकम्</p>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Convert HTML string to canvas and then to blob
 */
async function htmlToBlob(htmlString: string): Promise<Blob> {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.innerHTML = htmlString;
  document.body.appendChild(container);

  try {
    // Convert to canvas
    const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
      scale: 2,
      backgroundColor: null,
      logging: false,
    });

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      });
    });
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Download multiple employee ID cards as a ZIP file
 */
export async function downloadBulkIDCards(
  employees: Employee[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const total = employees.length * 2; // Front and back for each employee
  let current = 0;

  for (const employee of employees) {
    try {
      // Generate front side
      const frontHTML = generateIDCardHTML(employee, 'front');
      const frontBlob = await htmlToBlob(frontHTML);
      const frontFilename = `${employee.name.replace(/\s+/g, '_')}_${employee.employee_id}_Front.png`;
      zip.file(frontFilename, frontBlob);
      
      current++;
      if (onProgress) onProgress(current, total);

      // Generate back side
      const backHTML = generateIDCardHTML(employee, 'back');
      const backBlob = await htmlToBlob(backHTML);
      const backFilename = `${employee.name.replace(/\s+/g, '_')}_${employee.employee_id}_Back.png`;
      zip.file(backFilename, backBlob);
      
      current++;
      if (onProgress) onProgress(current, total);
    } catch (error) {
      console.error(`Error generating ID card for ${employee.name}:`, error);
    }
  }

  // Generate ZIP file and trigger download
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Employee_ID_Cards_${new Date().toISOString().split('T')[0]}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}
