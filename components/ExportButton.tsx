import { ClassEntry } from '@/lib/types'
export function ExportButton({ classes }: { classes: ClassEntry[] }) {
  return <button className="text-xs text-yellow-400 border border-yellow-400/30 px-3 py-1.5 rounded-lg font-mono">Export</button>
}
