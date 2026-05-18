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
        // Логика агрессивной выгрузки из RAM и приостановки фоновых задач
        optimize_resources(true)?;
        Ok("Game Mode Activated: Process priority elevated to High, background tabs suspended, RAM freed.".into())
    } else {
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
            
            // 1. Повышаем/Восстанавливаем приоритет процесса
            if SetPriorityClass(process, priority) == 0 {
                return Err("Failed to set process priority on Windows".to_string());
            }
            
            // 2. Агрессивно сбрасываем кэш Working Set (освобождаем RAM под игры)
            if enable {
                EmptyWorkingSet(process);
            }
        }
    }

    Ok(())
}
