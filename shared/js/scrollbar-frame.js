// Coalesce native scroll/resize signals; read every region before writing any rail.
const pending = new Set();
let frame;
export function scheduleScrollbar(handle) {
  pending.add(handle);
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = null;
    const handles = [...pending];
    pending.clear();
    const snapshots = handles.map((handle) => handle.read());
    handles.forEach((handle, index) => handle.write(snapshots[index]));
  });
}
export function cancelScrollbar(handle) {
  pending.delete(handle);
}
