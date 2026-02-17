use std::process::{Child, Command};
use std::sync::Mutex;
use std::time::Duration;
use tauri::Manager;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

struct ServerProcess(Mutex<Option<Child>>);

fn start_express_server() -> Option<Child> {
    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()));

    let mut paths = vec![];

    if let Some(ref dir) = exe_dir {
        // Installed app: resources are next to the exe or in subdirectories
        paths.push(dir.join("server.js"));
        paths.push(dir.join("resources").join("server.js"));
        paths.push(dir.join("..").join("server.js"));
        paths.push(dir.join("..").join("..").join("server.js"));
        paths.push(dir.join("..").join("..").join("..").join("server.js"));
    }

    // Dev mode: project root
    if let Ok(cwd) = std::env::current_dir() {
        paths.push(cwd.join("server.js"));
    }

    let server_js = paths.iter()
        .find(|p| p.exists())
        .cloned()
        .unwrap_or_else(|| {
            eprintln!("WARNING: server.js not found in any location");
            if let Some(ref dir) = exe_dir {
                // Log what IS in the exe directory for debugging
                if let Ok(entries) = std::fs::read_dir(dir) {
                    eprintln!("Files in exe dir {:?}:", dir);
                    for entry in entries.flatten() {
                        eprintln!("  {:?}", entry.file_name());
                    }
                }
            }
            std::env::current_dir().unwrap().join("server.js")
        });

    let working_dir = server_js.parent().unwrap().to_path_buf();

    println!("Starting Express server: {:?}", server_js);
    println!("Working directory: {:?}", working_dir);

    let mut cmd = Command::new("node");
    cmd.arg(&server_js).current_dir(&working_dir);

    #[cfg(target_os = "windows")]
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW

    cmd.spawn()
        .map_err(|e| eprintln!("Failed to start Express server: {}", e))
        .ok()
}

fn wait_for_server(port: u16, timeout_secs: u64) -> bool {
    let start = std::time::Instant::now();
    let timeout = Duration::from_secs(timeout_secs);
    let url = format!("http://localhost:{}/api/test", port);

    println!("Waiting for Express server on port {}...", port);

    while start.elapsed() < timeout {
        match reqwest::blocking::get(&url) {
            Ok(resp) if resp.status().is_success() => {
                println!("Express server is ready!");
                return true;
            }
            _ => {
                std::thread::sleep(Duration::from_millis(500));
            }
        }
    }

    eprintln!("Timeout waiting for Express server after {}s", timeout_secs);
    false
}

fn kill_process_tree(child: &mut Child) {
    let pid = child.id();
    println!("Killing Express server (PID: {})...", pid);

    #[cfg(target_os = "windows")]
    {
        let mut kill_cmd = Command::new("taskkill");
        kill_cmd.args(["/PID", &pid.to_string(), "/T", "/F"]);
        kill_cmd.creation_flags(0x08000000);
        let _ = kill_cmd.output();
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = Command::new("kill")
            .args(["-TERM", &pid.to_string()])
            .output();
    }

    let _ = child.wait();
    println!("Express server stopped.");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Start Express server
            let child = start_express_server();

            if child.is_some() {
                // Wait for server to be ready (max 30 seconds)
                if !wait_for_server(3002, 30) {
                    eprintln!("Express server may not be ready, opening window anyway...");
                }
            } else {
                eprintln!("Could not start Express server - check if Node.js is installed");
            }

            app.manage(ServerProcess(Mutex::new(child)));
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                // Kill Express server when window is closed
                let state = window.state::<ServerProcess>();
                let mut guard = match state.0.lock() {
                    Ok(g) => g,
                    Err(_) => return,
                };
                if let Some(ref mut child) = *guard {
                    kill_process_tree(child);
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Hipare");
}
