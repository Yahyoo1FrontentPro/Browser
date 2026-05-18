use tauri::command;

pub const OWNER_KEY: &str = "SUPER_ADMIN_777";

#[command]
pub fn verify_premium(key: String) -> bool {
    if key == OWNER_KEY {
        println!("🔥 GOD MODE ACTIVATED 🔥");
        true
    } else {
        false
    }
}
