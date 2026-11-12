$ErrorActionPreference = 'Stop'
$taskDirectory = $PSScriptRoot
$qaDirectory = Join-Path $taskDirectory 'qa'
New-Item -ItemType Directory -Force -Path $qaDirectory | Out-Null
$wordTask = $null
$documentTask = $null
try {
    $wordTask = New-Object -ComObject Word.Application
    $wordTask.Visible = $false
    $wordTask.DisplayAlerts = 0
    foreach ($language in @('EN','ZH')) {
        $docxPath = [System.IO.Path]::GetFullPath((Join-Path $taskDirectory ('Health_value_AI_' + $language + '.docx')))
        $pdfPath = [System.IO.Path]::GetFullPath((Join-Path $qaDirectory ('Word_' + $language + '.pdf')))
        $documentTask = $wordTask.Documents.Open($docxPath, $false, $true)
        $documentTask.Repaginate()
        $documentTask.ExportAsFixedFormat($pdfPath, 17)
        Write-Output ($language + ' Word pages: ' + $documentTask.ComputeStatistics(2))
        $documentTask.Close(0)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($documentTask)
        $documentTask = $null
    }
} finally {
    if ($null -ne $documentTask) { $documentTask.Close(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($documentTask) }
    if ($null -ne $wordTask) { $wordTask.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($wordTask) }
}
