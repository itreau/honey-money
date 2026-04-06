export interface Database {
  public: {
    Tables: {
      months: {
        Row: {
          id: number
          year: number
          month: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          year: number
          month: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          year?: number
          month?: number
          name?: string
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: number
          month_id: number
          category: string
          budget: number
          amount: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: number
          month_id: number
          category: string
          budget?: number
          amount?: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          month_id?: number
          category?: string
          budget?: number
          amount?: number
          note?: string | null
          created_at?: string
        }
      }
      pay: {
        Row: {
          id: number
          amount: number
          created_at: string
        }
        Insert: {
          id?: number
          amount: number
          created_at?: string
        }
        Update: {
          id?: number
          amount?: number
          created_at?: string
        }
      }
      expense_templates: {
        Row: {
          id: number
          category: string
          default_amount: number
          note: string | null
        }
        Insert: {
          id?: number
          category: string
          default_amount?: number
          note?: string | null
        }
        Update: {
          id?: number
          category?: string
          default_amount?: number
          note?: string | null
        }
      }
    }
  }
}