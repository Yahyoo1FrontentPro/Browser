// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod features;
mod system;

use system::{toggle_game_mode, AppState};
use features::premium::verify_premium;

fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![toggle_game_mode, verify_premium])
        .setup(|_app| {
            // Optional setup logic: applying vibrancy, transparency, etc.
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
