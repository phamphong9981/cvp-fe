'use client'

import React, { useState, useCallback } from 'react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { parseSchedulesFromCSV } from '@/utils/csvParser'

interface CSVUploadProps {
    onFileSelect: (data: any[]) => void
    onUpload: (data: any[]) => void
    isUploading?: boolean
}

export function CSVUpload({ onFileSelect, onUpload, isUploading = false }: CSVUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)

    const parseCSV = useCallback((csvText: string) => {
        try {
            const result = parseSchedulesFromCSV(csvText)
            console.log('Parsed schedules:', result.length)
            return result
        } catch (error) {
            console.error('Error parsing CSV:', error)
            return []
        }
    }, [])

    const handleFileSelect = useCallback((file: File) => {
        if (!file.name.endsWith('.csv')) {
            alert('Vui lòng chọn file CSV')
            return
        }

        setSelectedFile(file)

        const reader = new FileReader()
        reader.onload = (e) => {
            const csvText = e.target?.result as string
            const parsedData = parseCSV(csvText)
            onFileSelect(parsedData)
        }
        reader.readAsText(file, 'utf-8')
    }, [parseCSV, onFileSelect])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFileSelect(files[0])
        }
    }, [handleFileSelect])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFileSelect(files[0])
        }
    }, [handleFileSelect])

    const handleUpload = useCallback(() => {
        if (selectedFile) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const csvText = e.target?.result as string
                const parsedData = parseCSV(csvText)
                onUpload(parsedData)
            }
            reader.readAsText(selectedFile, 'utf-8')
        }
    }, [selectedFile, parseCSV, onUpload])

    return (
        <Card className="p-6">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Upload Thời Khóa Biểu CSV
                    </h3>
                    <p className="text-sm text-gray-600">
                        Chọn file CSV theo format mẫu để upload thời khóa biểu
                    </p>
                </div>

                {/* Drag & Drop Area */}
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className="space-y-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h2m-6 4h.01M21 10h2m-6 4h.01M17 10h2m-6 4h.01M13 10h2m-6 4h.01M9 10h2m-6 4h.01M5 10h2m-6 4h.01M1 10h2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600">Click để chọn file</span> hoặc kéo thả vào đây
                        </div>
                        <div className="text-xs text-gray-500">Chỉ hỗ trợ file .csv</div>
                    </div>
                </div>

                {/* File Input */}
                <div className="space-y-2">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="csv-file-input"
                    />
                    <label
                        htmlFor="csv-file-input"
                        className="block w-full cursor-pointer"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                console.log('Button clicked, triggering file input')
                                document.getElementById('csv-file-input')?.click()
                            }}
                        >
                            Chọn File CSV
                        </Button>
                    </label>
                </div>

                {/* Selected File Info */}
                {selectedFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium text-green-800">
                                File đã chọn: {selectedFile.name}
                            </span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                            Kích thước: {(selectedFile.size / 1024).toFixed(1)} KB
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                {selectedFile && (
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full"
                    >
                        {isUploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang upload...
                            </>
                        ) : (
                            'Upload Thời Khóa Biểu'
                        )}
                    </Button>
                )}
            </div>
        </Card>
    )
}
