import { Extension } from '@tiptap/core'

export const COVER_PAGE_TEMPLATES = {
  STANDARD: {
    name: 'Standard',
    description: 'Simple centered layout with company name, title, and metadata',
    generateHTML: (data) => {
      const {
        companyName = 'Arni Medica',
        title = 'Document Title',
        subtitle = '',
        author = '',
        date = new Date().toLocaleDateString(),
        documentNumber = '',
        revision = '',
        department = '',
      } = data

      return `
        <div style="page-break-after: always; margin: 0; padding: 60px 40px; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; background: white; font-family: Arial, sans-serif; color: #1a1a1a; text-align: center;">
          <div></div>

          <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 40px;">
            <div style="font-size: 14px; font-weight: 600; letter-spacing: 1px; color: #666;">
              ${companyName}
            </div>

            <div style="border-top: 3px solid #1a1a1a; border-bottom: 3px solid #1a1a1a; padding: 30px 0;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 700; line-height: 1.4; margin-bottom: 20px;">
                ${title}
              </h1>
              ${subtitle ? `<div style="font-size: 18px; color: #666; margin-top: 15px;">${subtitle}</div>` : ''}
            </div>
          </div>

          <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 30px; font-size: 12px; color: #666; line-height: 1.8;">
            ${author ? `<div><strong>Prepared by:</strong> ${author}</div>` : ''}
            ${date ? `<div><strong>Date:</strong> ${date}</div>` : ''}
            ${documentNumber ? `<div><strong>Document Number:</strong> ${documentNumber}</div>` : ''}
            ${revision ? `<div><strong>Revision:</strong> ${revision}</div>` : ''}
          </div>
        </div>
      `
    },
  },

  FORMAL: {
    name: 'Formal',
    description: 'Professional layout with top border, company name, and info table',
    generateHTML: (data) => {
      const {
        companyName = 'Arni Medica',
        title = 'Document Title',
        subtitle = '',
        author = '',
        date = new Date().toLocaleDateString(),
        documentNumber = '',
        revision = '',
        department = '',
      } = data

      return `
        <div style="page-break-after: always; margin: 0; padding: 0; min-height: 100vh; background: white; font-family: Arial, sans-serif; color: #1a1a1a; display: flex; flex-direction: column;">
          <div style="border-top: 8px solid #2c3e50; padding: 50px 40px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">

            <div>
              <div style="font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #2c3e50; margin-bottom: 50px; text-transform: uppercase;">
                ${companyName}
              </div>

              <h1 style="margin: 0; font-size: 32px; font-weight: 700; line-height: 1.4; margin-bottom: 15px; color: #1a1a1a;">
                ${title}
              </h1>
              ${subtitle ? `<h2 style="margin: 0; font-size: 16px; font-weight: 400; color: #666; margin-bottom: 40px;">${subtitle}</h2>` : ''}
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa; font-weight: 600; font-size: 11px; color: #2c3e50; text-transform: uppercase; width: 35%;">Document Number</td>
                <td style="border: 1px solid #ddd; padding: 12px; font-size: 12px;">${documentNumber || 'TBD'}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa; font-weight: 600; font-size: 11px; color: #2c3e50; text-transform: uppercase;">Revision</td>
                <td style="border: 1px solid #ddd; padding: 12px; font-size: 12px;">${revision || '0'}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa; font-weight: 600; font-size: 11px; color: #2c3e50; text-transform: uppercase;">Prepared By</td>
                <td style="border: 1px solid #ddd; padding: 12px; font-size: 12px;">${author || 'Unassigned'}</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa; font-weight: 600; font-size: 11px; color: #2c3e50; text-transform: uppercase;">Date</td>
                <td style="border: 1px solid #ddd; padding: 12px; font-size: 12px;">${date}</td>
              </tr>
              ${department ? `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa; font-weight: 600; font-size: 11px; color: #2c3e50; text-transform: uppercase;">Department</td>
                <td style="border: 1px solid #ddd; padding: 12px; font-size: 12px;">${department}</td>
              </tr>
              ` : ''}
            </table>
          </div>
        </div>
      `
    },
  },

  MINIMAL: {
    name: 'Minimal',
    description: 'Clean and minimal design with title, subtitle, and metadata',
    generateHTML: (data) => {
      const {
        companyName = 'Arni Medica',
        title = 'Document Title',
        subtitle = '',
        author = '',
        date = new Date().toLocaleDateString(),
        documentNumber = '',
        revision = '',
        department = '',
      } = data

      return `
        <div style="page-break-after: always; margin: 0; padding: 60px 40px; min-height: 100vh; background: white; font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; display: flex; flex-direction: column; justify-content: space-between;">

          <div></div>

          <div style="text-align: center;">
            <h1 style="margin: 0; font-size: 40px; font-weight: 300; letter-spacing: -0.5px; margin-bottom: 20px; line-height: 1.2;">
              ${title}
            </h1>
            ${subtitle ? `<p style="margin: 0; font-size: 16px; color: #999; font-weight: 300; letter-spacing: 0.5px;">${subtitle}</p>` : ''}
          </div>

          <div style="text-align: right; font-size: 12px; color: #999; line-height: 1.8;">
            ${author ? `<div>${author}</div>` : ''}
            ${date ? `<div>${date}</div>` : ''}
            ${documentNumber ? `<div style="margin-top: 10px;">Doc: ${documentNumber}</div>` : ''}
            ${revision ? `<div>Rev: ${revision}</div>` : ''}
          </div>
        </div>
      `
    },
  },
}

export const CoverPage = Extension.create({
  name: 'coverPage',

  addStorage() {
    return {
      template: null,
      data: {
        title: '',
        subtitle: '',
        author: '',
        date: new Date().toLocaleDateString(),
        documentNumber: '',
        revision: '',
        companyName: 'Arni Medica',
        department: '',
      },
    }
  },

  addCommands() {
    return {
      setCoverPage:
        (templateKey, data) =>
        ({ commands, editor }) => {
          // Validate template exists
          if (!COVER_PAGE_TEMPLATES[templateKey]) {
            console.error(`Cover page template "${templateKey}" not found`)
            return false
          }

          // Update storage
          this.storage.template = templateKey
          this.storage.data = {
            ...this.storage.data,
            ...data,
          }

          return true
        },

      getCoverPage: () => () => {
        return {
          template: this.storage.template,
          data: this.storage.data,
        }
      },

      clearCoverPage: () => () => {
        this.storage.template = null
        this.storage.data = {
          title: '',
          subtitle: '',
          author: '',
          date: new Date().toLocaleDateString(),
          documentNumber: '',
          revision: '',
          companyName: 'Arni Medica',
          department: '',
        }
        return true
      },

      insertCoverPage: () => ({ commands, editor }) => {
        const { template, data } = this.storage

        if (!template) {
          console.error('No cover page template selected')
          return false
        }

        const templateObj = COVER_PAGE_TEMPLATES[template]
        if (!templateObj) {
          console.error(`Cover page template "${template}" not found`)
          return false
        }

        const html = templateObj.generateHTML(data)

        // Insert cover page HTML at the beginning of the document
        return commands.insertContentAt(0, html)
      },
    }
  },
})
