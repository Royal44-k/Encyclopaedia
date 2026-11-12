# Fully hypothetical arithmetic demonstration; no participant data or health coefficients.
$ErrorActionPreference = 'Stop'
$taskMinutesWithoutAI = 600
$taskMinutesWithAIIncludingVerification = 360
$savedTaskMinutes = $taskMinutesWithoutAI - $taskMinutesWithAIIncludingVerification
$scenarioRows = foreach ($addedTaskMinutes in @(0, 180, 300)) {
    $changeInWorkMinutes = $addedTaskMinutes - $savedTaskMinutes
    [pscustomobject]@{
        data_type = 'hypothetical_not_empirical'
        task_minutes_without_ai = $taskMinutesWithoutAI
        task_minutes_with_ai_all_costs = $taskMinutesWithAIIncludingVerification
        saved_task_minutes = $savedTaskMinutes
        added_task_minutes = $addedTaskMinutes
        change_in_work_minutes = $changeInWorkMinutes
        change_in_nonwork_minutes = -$changeInWorkMinutes
        quality_matched = 'assumed_not_measured'
        other_work_unchanged = 'assumed_not_measured'
        health_effect = 'not_estimated'
    }
}
$outputPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'AI时间配置_假设情景.csv'
$scenarioRows | Export-Csv -LiteralPath $outputPath -Encoding UTF8 -NoTypeInformation
$scenarioRows | Format-Table added_task_minutes, saved_task_minutes, change_in_work_minutes, change_in_nonwork_minutes -AutoSize
Write-Output ('Saved: ' + $outputPath)
