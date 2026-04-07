export interface Database {
  public: {
    Tables: {
      months: {
        Row: {
          id: string
          year: number
          month: number
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          year: number
          month: number
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          year?: number
          month?: number
          name?: string
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          month_id: string
          category: string
          budget: number
          amount: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          month_id: string
          category: string
          budget?: number
          amount?: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          month_id?: string
          category?: string
          budget?: number
          amount?: number
          note?: string | null
          created_at?: string
        }
      }
      pay: {
        Row: {
          id: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          created_at?: string
        }
      }
      expense_templates: {
        Row: {
          id: string
          category: string
          default_amount: number
          note: string | null
        }
        Insert: {
          id?: string
          category: string
          default_amount?: number
          note?: string | null
        }
        Update: {
          id?: string
          category?: string
          default_amount?: number
          note?: string | null
        }
      }
    }
  }
}