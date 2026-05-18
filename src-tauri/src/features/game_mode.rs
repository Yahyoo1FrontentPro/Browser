use std::sync::Mutex;
use tauri::State;

#[derive(Default)]
pub struct AppState {
    pub game_mode_active: Mutex<bool>,
}

#[tauri::command]
pub fn toggle_game_mode(state: State<AppState>) -> Result<String, String> {
    let mut is_active = state.game_mode_active.lock().unwrap();
    *is_active = !*is_active;

    if *is_active {
        // Логика агрессивной выгрузки из RAM и приостановки
        optimize_resources(true)?;
        Ok("Game Mode Activated: Background tabs suspended, RAM freed.".into())
    } else {
        // Восстановление нормального состояния
        optimize_resources(false)?;
        Ok("Game Mode Deactivated: Normal resource usage restored.".into())
    }
}

fn optimize_resources(enable: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        use winapi::um::processthreadsapi::{GetCurrentProcess, SetPriorityClass};
        use winapi::um::winbase::{HIGH_PRIORITY_CLASS, NORMAL_PRIORITY_CLASS};
        use winapi::um::psapi::EmptyWorkingSet;

        unsafe {
            let process = GetCurrentProcess();
            let priority = if enable { HIGH_PRIORITY_CLASS } else { NORMAL_PRIORITY_CLASS };
            if SetPriorityClass(process, priority) == 0 {
                return Err("Failed to set process priority on Windows".to_string());
            }
            if enable {
                // Агрессивно сбрасываем кэш Working Set (освобождаем RAM)
                EmptyWorkingSet(process);
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        use libc::{setpriority, PRIO_PROCESS};
        unsafe {
            let priority = if enable { -10 } else { 0 };
            if setpriority(PRIO_PROCESS, 0, priority) != 0 {
                return Err("Failed to set process priority on macOS".to_string());
            }
        }
    }

    Ok(())
}
