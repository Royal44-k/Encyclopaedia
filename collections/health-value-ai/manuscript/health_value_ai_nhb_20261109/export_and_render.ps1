$ErrorActionPreference = 'Stop'
$taskDirectory = $PSScriptRoot
$wordTask = $null
$documentTask = $null
try {
    $wordTask = New-Object -ComObject Word.Application
    $wordTask.Visible = $false
    $wordTask.DisplayAlerts = 0
    foreach ($stem in @('Health_value_NHB_EN','Health_value_NHB_ZH','Supporting_information_EN','Supporting_information_ZH')) {
        $docxPath = [System.IO.Path]::GetFullPath((Join-Path $taskDirectory ($stem + '.docx')))
        $pdfPath = [System.IO.Path]::GetFullPath((Join-Path $taskDirectory ($stem + '.pdf')))
        $documentTask = $wordTask.Documents.Open($docxPath, $false, $false)
        [void]$documentTask.Fields.Update()
        $documentTask.Repaginate()
        $documentTask.Save()
        $documentTask.ExportAsFixedFormat($pdfPath, 17)
        Write-Output ($stem + ' pages: ' + $documentTask.ComputeStatistics(2))
        $documentTask.Close(0)
        [void][Runtime.InteropServices.Marshal]::ReleaseComObject($documentTask)
        $documentTask = $null
    }
} finally {
    if ($null -ne $documentTask) { $documentTask.Close(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($documentTask) }
    if ($null -ne $wordTask) { $wordTask.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($wordTask) }
}
